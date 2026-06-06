import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/layout/Shell";
import OntologyList from "./pages/build-studio/OntologyList";
import StudioHome from "./pages/build-studio/StudioHome";
import BuildOverview from "./pages/build-studio/BuildOverview";
import ObjectTypeBuilder from "./pages/build-studio/ObjectTypeBuilder";
import LinkTypeBuilder from "./pages/build-studio/LinkTypeBuilder";
import MappingBuilder from "./pages/build-studio/MappingBuilder";
import ValidationCenter from "./pages/build-studio/ValidationCenter";
import HistoryDiff from "./pages/build-studio/HistoryDiff";

import AnalysisHome from "./pages/analysis/AnalysisHome";
import ActionTypeBuilder from "./pages/actions/ActionTypeBuilder";
import RunCenter from "./pages/actions/RunCenter";
import RunDetail from "./pages/actions/RunDetail";
import InterfacesPage from "./pages/apps/InterfacesPage";
import AppShell from "./pages/apps/AppShell";
import RecordPage from "./pages/apps/RecordPage";
import ListPage from "./pages/apps/ListPage";
import Dashboard from "./pages/apps/Dashboard";
import Workspace from "./pages/apps/Workspace";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { appApi, AppPage } from "./api/app";

function DynamicPageRouter() {
  const { appId, pageId } = useParams<{ appId: string; pageId: string }>();
  const [page, setPage] = useState<AppPage | null>(null);

  useEffect(() => {
    if (pageId && appId) {
      appApi.getAppPages(appId).then(pages => {
        setPage(pages.find(p => p.id === pageId) || null);
      });
    }
  }, [pageId, appId]);

  if (!page) return null;

  switch (page.type) {
    case 'record': return <RecordPage />;
    case 'list': return <ListPage />;
    case 'dashboard': return <Dashboard />;
    case 'workspace': return <Workspace />;
    default: return <Workspace />;
  }
}
import GovernancePage from "./pages/governance/GovernancePage";
import Permissions from "./pages/governance/Permissions";
import Audit from "./pages/governance/Audit";
import Alerts from "./pages/governance/Alerts";
import OQCM from "./pages/governance/OQCM";
import UsageAnalytics from "./pages/governance/UsageAnalytics";
import Configuration from "./pages/governance/Configuration";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="/build" replace />} />
          <Route path="build" element={<OntologyList />} />
          <Route path="build/:ontologyId" element={<StudioHome />}>
            <Route index element={<BuildOverview />} />
            <Route path="objects" element={<ObjectTypeBuilder />} />
            <Route path="objects/:objectTypeId" element={<ObjectTypeBuilder />} />
            <Route path="links" element={<LinkTypeBuilder />} />
            <Route path="links/:linkTypeId" element={<LinkTypeBuilder />} />
            <Route path="mappings" element={<MappingBuilder />} />
            <Route path="validation" element={<ValidationCenter />} />
            <Route path="history" element={<HistoryDiff />} />
          </Route>
          
          <Route path="analysis/*" element={<AnalysisHome />} />
          <Route path="actions" element={<ActionTypeBuilder />} />
          <Route path="actions/runs" element={<RunCenter />} />
          <Route path="actions/runs/:runId" element={<RunDetail />} />
          <Route path="apps" element={<InterfacesPage />} />
          <Route path="apps/:appId" element={<AppShell />}>
            <Route index element={<Workspace />} />
            <Route path="pages/:pageId" element={<DynamicPageRouter />} />
            <Route path="pages/:pageId/records/:recordId" element={<RecordPage />} />
          </Route>
          <Route path="governance" element={<GovernancePage />}>
            <Route index element={<UsageAnalytics />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="audit" element={<Audit />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="oqcm" element={<OQCM />} />
            <Route path="usage" element={<UsageAnalytics />} />
            <Route path="config" element={<Configuration />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
