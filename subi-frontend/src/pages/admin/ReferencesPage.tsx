import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  DollarSign,
  FileText,
  Users,
  Gavel,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

interface ReferenceEntityInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  status: 'available' | 'development' | 'planned';
  adminOnly?: boolean;
}

export const ReferencesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('ADMIN');

  const referenceEntities: ReferenceEntityInfo[] = [
    {
      id: 'currencies',
      name: t('references.entities.currencies'),
      description: 'Manage system currencies and exchange rates',
      icon: DollarSign,
      route: '/admin/currencies',
      status: 'available',
      adminOnly: true,
    },
    {
      id: 'creditPurposes',
      name: t('references.entities.creditPurposes'),
      description: 'Define available credit purposes and categories',
      icon: CreditCard,
      route: '/admin/credit-purposes',
      status: 'development',
      adminOnly: false,
    },
    {
      id: 'documentTypes',
      name: t('references.entities.documentTypes'),
      description: 'Configure document types and requirements',
      icon: FileText,
      route: '/admin/document-types',
      status: 'development',
      adminOnly: false,
    },
    {
      id: 'decisionMakingBodies',
      name: t('references.entities.decisionMakingBodies'),
      description: 'Manage decision-making bodies and committees',
      icon: Users,
      route: '/admin/decision-making-bodies',
      status: 'available',
      adminOnly: true,
    },
    {
      id: 'decisionTypes',
      name: t('references.entities.decisionTypes'),
      description: 'Define types of decisions and processes',
      icon: Gavel,
      route: '/admin/decision-types',
      status: 'available',
      adminOnly: true,
    },
    {
      id: 'floatingRateTypes',
      name: t('references.entities.floatingRateTypes'),
      description: 'Configure floating interest rate types',
      icon: TrendingUp,
      route: '/admin/floating-rate-types',
      status: 'development',
      adminOnly: false,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Available
          </Badge>
        );
      case 'development':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            In Development
          </Badge>
        );
      case 'planned':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Planned
          </Badge>
        );
      default:
        return null;
    }
  };

  const availableEntities = referenceEntities.filter(
    entity => !entity.adminOnly || isAdmin
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Database className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">{t('references.title')}</h1>
          <p className="text-gray-500">
            {t('references.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableEntities.map((entity) => {
          const IconComponent = entity.icon;
          const isClickable = entity.status === 'available';

          return (
            <Card
              key={entity.id}
              className={`transition-all duration-200 ${
                isClickable
                  ? 'hover:shadow-lg hover:border-blue-300 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{entity.name}</CardTitle>
                      {getStatusBadge(entity.status)}
                    </div>
                  </div>
                  {entity.adminOnly && (
                    <Badge variant="secondary" className="text-xs">
                      Admin Only
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {entity.description}
                </CardDescription>

                {isClickable ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={entity.route} className="flex items-center justify-center gap-2">
                      {t('references.actions.view')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    {entity.status === 'development' ? 'Coming Soon' : 'Planned'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isAdmin && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Limited Access
              </h3>
              <p className="text-gray-500">
                Some reference data management features require administrator privileges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
