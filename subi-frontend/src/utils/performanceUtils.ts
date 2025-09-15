/**
 * Performance monitoring utilities for virtual scrolling and large data rendering
 */

export interface PerformanceMetrics {
  renderTime: number;
  scrollLatency: number;
  memoryUsage: number;
  domNodes: number;
  fps: number;
  timestamp: number;
}

export interface PerformanceBenchmark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Performance Monitor class for tracking and analyzing performance metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance metrics
   */
  startMonitoring(): void {
    if (this.isMonitoring) {return;}

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();

    // Start FPS monitoring
    this.monitorFPS();

    console.log('[PerformanceMonitor] Started monitoring');
  }

  /**
   * Stop monitoring performance metrics
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[PerformanceMonitor] Stopped monitoring');
  }

  /**
   * Start a performance benchmark
   */
  startBenchmark(name: string, metadata?: Record<string, any>): void {
    const benchmark: PerformanceBenchmark = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.benchmarks.set(name, benchmark);
    console.log(`[PerformanceMonitor] Started benchmark: ${name}`);
  }

  /**
   * End a performance benchmark
   */
  endBenchmark(name: string): number | null {
    const benchmark = this.benchmarks.get(name);
    if (!benchmark) {
      console.warn(`[PerformanceMonitor] Benchmark not found: ${name}`);
      return null;
    }

    benchmark.endTime = performance.now();
    benchmark.duration = benchmark.endTime - benchmark.startTime;

    console.log(`[PerformanceMonitor] Ended benchmark: ${name} - Duration: ${benchmark.duration.toFixed(2)}ms`);

    return benchmark.duration;
  }

  /**
   * Get benchmark results
   */
  getBenchmark(name: string): PerformanceBenchmark | null {
    return this.benchmarks.get(name) || null;
  }

  /**
   * Get all benchmarks
   */
  getAllBenchmarks(): PerformanceBenchmark[] {
    return Array.from(this.benchmarks.values());
  }

  /**
   * Clear all benchmarks
   */
  clearBenchmarks(): void {
    this.benchmarks.clear();
    console.log('[PerformanceMonitor] Cleared all benchmarks');
  }

  /**
   * Monitor FPS
   */
  private monitorFPS(): void {
    if (!this.isMonitoring) {return;}

    const measure = () => {
      if (!this.isMonitoring) {return;}

      const now = performance.now();
      this.frameCount++;

      // Calculate FPS every second
      if (now - this.lastFrameTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));

        // Collect performance metrics
        const metrics: PerformanceMetrics = {
          renderTime: this.getAverageRenderTime(),
          scrollLatency: this.getScrollLatency(),
          memoryUsage: this.getMemoryUsage(),
          domNodes: this.getDOMNodeCount(),
          fps,
          timestamp: now,
        };

        this.metrics.push(metrics);

        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
          this.metrics = this.metrics.slice(-100);
        }

        this.frameCount = 0;
        this.lastFrameTime = now;
      }

      requestAnimationFrame(measure);
    };

    requestAnimationFrame(measure);
  }

  /**
   * Get average render time from recent benchmarks
   */
  private getAverageRenderTime(): number {
    const renderBenchmarks = Array.from(this.benchmarks.values())
      .filter(b => b.name.includes('render') && b.duration !== undefined)
      .slice(-10); // Last 10 render benchmarks

    if (renderBenchmarks.length === 0) {return 0;}

    const totalTime = renderBenchmarks.reduce((sum, b) => sum + (b.duration || 0), 0);
    return totalTime / renderBenchmarks.length;
  }

  /**
   * Get scroll latency estimate
   */
  private getScrollLatency(): number {
    // This is a simplified estimate based on recent scroll benchmarks
    const scrollBenchmarks = Array.from(this.benchmarks.values())
      .filter(b => b.name.includes('scroll') && b.duration !== undefined)
      .slice(-5);

    if (scrollBenchmarks.length === 0) {return 0;}

    const totalTime = scrollBenchmarks.reduce((sum, b) => sum + (b.duration || 0), 0);
    return totalTime / scrollBenchmarks.length;
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Get DOM node count
   */
  private getDOMNodeCount(): number {
    return document.getElementsByTagName('*').length;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageFPS: number;
    averageRenderTime: number;
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    averageDOMNodes: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageFPS: 0,
        averageRenderTime: 0,
        averageMemoryUsage: 0,
        peakMemoryUsage: 0,
        averageDOMNodes: 0,
      };
    }

    const totalFPS = this.metrics.reduce((sum, m) => sum + m.fps, 0);
    const totalRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0);
    const totalMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const totalDOMNodes = this.metrics.reduce((sum, m) => sum + m.domNodes, 0);
    const peakMemoryUsage = Math.max(...this.metrics.map(m => m.memoryUsage));

    return {
      averageFPS: totalFPS / this.metrics.length,
      averageRenderTime: totalRenderTime / this.metrics.length,
      averageMemoryUsage: totalMemoryUsage / this.metrics.length,
      peakMemoryUsage,
      averageDOMNodes: totalDOMNodes / this.metrics.length,
    };
  }

  /**
   * Export performance data as JSON
   */
  exportData(): {
    benchmarks: PerformanceBenchmark[];
    metrics: PerformanceMetrics[];
    summary: ReturnType<typeof this.getPerformanceSummary>;
  } {
    return {
      benchmarks: this.getAllBenchmarks(),
      metrics: this.getAllMetrics(),
      summary: this.getPerformanceSummary(),
    };
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const summary = this.getPerformanceSummary();
    const currentMetrics = this.getCurrentMetrics();

    console.group('[PerformanceMonitor] Performance Summary');
    console.log('Average FPS:', summary.averageFPS.toFixed(1));
    console.log('Average Render Time:', summary.averageRenderTime.toFixed(2) + 'ms');
    console.log('Average Memory Usage:', summary.averageMemoryUsage.toFixed(2) + 'MB');
    console.log('Peak Memory Usage:', summary.peakMemoryUsage.toFixed(2) + 'MB');
    console.log('Average DOM Nodes:', Math.round(summary.averageDOMNodes));

    if (currentMetrics) {
      console.log('Current FPS:', currentMetrics.fps);
      console.log('Current Memory Usage:', currentMetrics.memoryUsage.toFixed(2) + 'MB');
      console.log('Current DOM Nodes:', currentMetrics.domNodes);
    }

    // Log recent benchmarks
    const recentBenchmarks = this.getAllBenchmarks().slice(-10);
    if (recentBenchmarks.length > 0) {
      console.log('Recent Benchmarks:');
      recentBenchmarks.forEach(b => {
        if (b.duration) {
          console.log(`  ${b.name}: ${b.duration.toFixed(2)}ms`);
        }
      });
    }

    console.groupEnd();
  }
}

/**
 * Convenience function to get the global performance monitor instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Higher-order component for monitoring component performance
 */
export function withPerformanceMonitoring<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return (props: T) => {
    const renderStart = React.useRef<number>(0);

    // Monitor render start
    React.useLayoutEffect(() => {
      renderStart.current = performance.now();
      performanceMonitor.startBenchmark(`${componentName}-render`);
    });

    // Monitor render end
    React.useLayoutEffect(() => {
      const renderEnd = performance.now();
      performanceMonitor.endBenchmark(`${componentName}-render`);

      const renderTime = renderEnd - renderStart.current;
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    });

    return React.createElement(WrappedComponent, props);
  };
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring(name: string) {
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  const startMonitoring = React.useCallback(() => {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = React.useCallback(() => {
    performanceMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  const startBenchmark = React.useCallback((benchmarkName: string, metadata?: Record<string, any>) => {
    performanceMonitor.startBenchmark(`${name}-${benchmarkName}`, metadata);
  }, [name]);

  const endBenchmark = React.useCallback((benchmarkName: string) => {
    return performanceMonitor.endBenchmark(`${name}-${benchmarkName}`);
  }, [name]);

  const getCurrentMetrics = React.useCallback(() => {
    return performanceMonitor.getCurrentMetrics();
  }, []);

  const getSummary = React.useCallback(() => {
    return performanceMonitor.getPerformanceSummary();
  }, []);

  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    startBenchmark,
    endBenchmark,
    getCurrentMetrics,
    getSummary,
    logSummary: performanceMonitor.logSummary.bind(performanceMonitor),
  };
}

/**
 * Utility function to measure function execution time
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T> | T,
  name: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  performanceMonitor.startBenchmark(name);

  try {
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    performanceMonitor.endBenchmark(name);

    return { result, duration };
  } catch (error) {
    performanceMonitor.endBenchmark(name);
    throw error;
  }
}

/**
 * Utility to detect performance bottlenecks
 */
export class PerformanceDetector {
  private static readonly THRESHOLDS = {
    RENDER_TIME: 16, // 1 frame at 60fps
    SCROLL_LATENCY: 8, // Half frame
    LOW_FPS: 45,
    HIGH_MEMORY: 100, // 100MB
    HIGH_DOM_NODES: 5000,
  };

  static analyzePerformance(metrics: PerformanceMetrics[]): {
    issues: string[];
    recommendations: string[];
    score: number; // 0-100
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (metrics.length === 0) {
      return { issues: ['No performance data available'], recommendations: [], score: 0 };
    }

    const latest = metrics[metrics.length - 1];
    const averageFPS = metrics.reduce((sum, m) => sum + m.fps, 0) / metrics.length;
    const averageMemory = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;

    // Check FPS
    if (averageFPS < this.THRESHOLDS.LOW_FPS) {
      issues.push(`Low FPS detected: ${averageFPS.toFixed(1)} (target: 60)`);
      recommendations.push('Enable virtual scrolling for large lists');
      score -= 20;
    }

    // Check render time
    if (latest.renderTime > this.THRESHOLDS.RENDER_TIME) {
      issues.push(`Slow render time: ${latest.renderTime.toFixed(2)}ms`);
      recommendations.push('Optimize component rendering with memoization');
      score -= 15;
    }

    // Check scroll latency
    if (latest.scrollLatency > this.THRESHOLDS.SCROLL_LATENCY) {
      issues.push(`High scroll latency: ${latest.scrollLatency.toFixed(2)}ms`);
      recommendations.push('Reduce scroll handler complexity');
      score -= 15;
    }

    // Check memory usage
    if (averageMemory > this.THRESHOLDS.HIGH_MEMORY) {
      issues.push(`High memory usage: ${averageMemory.toFixed(2)}MB`);
      recommendations.push('Check for memory leaks and optimize data structures');
      score -= 10;
    }

    // Check DOM nodes
    if (latest.domNodes > this.THRESHOLDS.HIGH_DOM_NODES) {
      issues.push(`High DOM node count: ${latest.domNodes}`);
      recommendations.push('Use virtual scrolling to reduce DOM nodes');
      score -= 10;
    }

    return {
      issues,
      recommendations,
      score: Math.max(0, score),
    };
  }
}

export default performanceMonitor;