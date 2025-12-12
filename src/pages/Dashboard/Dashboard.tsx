import { PageHeader } from '@/components/common/Header';
import { useDashboardSummary } from '@/hooks/tanstackHooks/useDashboard';
import { EmployeeWidget } from './widgets/EmployeeWidget';
import { HRAdminWidget } from './widgets/HRAdminWidget';
import { OrgUnitHeadWidget } from './widgets/OrgUnitHeadWidget';
import type { DashboardWidget, EmployeeWidget as EmployeeWidgetType, HRAdminWidget as HRAdminWidgetType, OrgUnitHeadWidget as OrgUnitHeadWidgetType } from '@/services/dashboard/types';
import { Alert, AlertDescription, Button} from '@/components/common';
import { Loader2, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data, isLoading, error, refetch, isRefetching } = useDashboardSummary();

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.widget_type) {
      case 'employee':
        return <EmployeeWidget key={widget.widget_type} data={widget as EmployeeWidgetType} />;
      case 'hr_admin':
        return <HRAdminWidget key={widget.widget_type} data={widget as HRAdminWidgetType} />;
      case 'org_unit_head':
        return <OrgUnitHeadWidget key={widget.widget_type} data={widget as OrgUnitHeadWidgetType} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Dashboard"
          description="Selamat datang di ARGA HRIS - Human Resource Information System"
          breadcrumb={[]}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Memuat dashboard...</span>
        </div>
      )}

      {error && (
        <></>
        // <Alert variant="destructive">
        //   <AlertDescription>
        //     Gagal memuat dashboard: {error.message}
        //   </AlertDescription>
        // </Alert>
      )}

      {data?.data && (
        <>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Halo, {data.data.full_name}!
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.data.roles.length > 1
                ? `Anda memiliki ${data.data.roles.length} role: ${data.data.roles.join(', ')}`
                : `Role: ${data.data.roles[0]}`
              }
            </p>
          </div>

          {data.data.widgets.length === 0 ? (
            <Alert>
              <AlertDescription>
                Tidak ada widget dashboard untuk ditampilkan. Hubungi administrator jika Anda merasa ini adalah kesalahan.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {data.data.widgets
                .sort((a, b) => a.order - b.order)
                .map(renderWidget)}
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-6">
            Terakhir diperbarui: {new Date(data.data.generated_at).toLocaleString('id-ID')}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
