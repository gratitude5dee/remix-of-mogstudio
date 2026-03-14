import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import PerfShell from "@/components/perf/PerfShell";
import CustomCursor from "@/components/CustomCursor";
import { CursorLoadingProvider, useCursorLoading } from "@/contexts/CursorLoadingContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { appRoutes } from "@/lib/routes";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SettingsBillingPage = lazy(() => import("./pages/SettingsBillingPage"));
const SettingsBillingDocsPage = lazy(() => import("./pages/SettingsBillingDocsPage"));
const ProjectSetup = lazy(() => import("./pages/ProjectSetup"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const LearningStudioPage = lazy(() => import("./pages/LearningStudioPage"));
const StoryboardPage = lazy(() => import("./pages/StoryboardPage"));
const DirectorCutPage = lazy(() => import("./pages/DirectorCutPage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const Storyboard = lazy(() => import("./pages/Storyboard"));
const ShotEditor = lazy(() => import("./pages/ShotEditor"));
const KanvasPage = lazy(() => import("./pages/KanvasPage"));
const AssetsPage = lazy(() => import("./pages/AssetsPage"));

const RedirectProjectTimelineAlias = () => {
  const { projectId } = useParams();
  return projectId ? <Navigate to={appRoutes.projects.timeline(projectId)} replace /> : <Navigate to={appRoutes.home} replace />;
};

const RedirectLegacyStudioProject = () => {
  const { projectId } = useParams();
  return projectId ? <Navigate to={appRoutes.projects.studio(projectId)} replace /> : <Navigate to={appRoutes.home} replace />;
};

const RedirectLegacyTimelineProject = () => {
  const { projectId } = useParams();
  return projectId ? <Navigate to={appRoutes.projects.timeline(projectId)} replace /> : <Navigate to={appRoutes.home} replace />;
};

const RedirectLegacyEditorProject = () => {
  const { projectId } = useParams();
  return projectId ? <Navigate to={appRoutes.projects.editor(projectId)} replace /> : <Navigate to={appRoutes.home} replace />;
};

const RedirectLegacyDirectorsCut = () => {
  const { projectId } = useParams();
  return projectId ? <Navigate to={appRoutes.projects.directorsCut(projectId)} replace /> : <Navigate to={appRoutes.home} replace />;
};

const CursorWrapper = () => {
  const { isLoading } = useCursorLoading();
  return <CustomCursor isLoading={isLoading} />;
};

const queryClient = new QueryClient();

const App = () => {
  const usePerfShell = (import.meta.env.VITE_USE_PERF_SHELL ?? 'true') !== 'false';
  const fallback = usePerfShell ? <PerfShell headline="Preparing studio" /> : null;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThirdwebProvider>
          <TooltipProvider>
            <BrowserRouter>
            <AuthProvider>
              <SidebarProvider>
              <CursorLoadingProvider>
                <LoadingScreen isLoading={isLoading} message="Initializing MOG Studio..." />
                <CursorWrapper />
                <Toaster />
                <Sonner />
                <Suspense fallback={fallback}>
                  <Routes>
                    <Route path={appRoutes.landing} element={<Landing />} />
                    <Route path={appRoutes.login} element={<Login />} />
                    <Route
                      path={appRoutes.home}
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.projectSetup}
                      element={
                        <ProtectedRoute>
                          <ProjectSetup />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.legacy.studioRoot}
                      element={
                        <ProtectedRoute>
                          <Navigate to={appRoutes.home} replace />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects/:projectId/studio"
                      element={
                        <ProtectedRoute>
                          <StudioPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.assets}
                      element={
                        <ProtectedRoute>
                          <AssetsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.learningStudio}
                      element={
                        <ProtectedRoute>
                          <LearningStudioPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects/:projectId/timeline"
                      element={
                        <ProtectedRoute>
                          <StoryboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects/:projectId/directors-cut"
                      element={
                        <ProtectedRoute>
                          <DirectorCutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/projects/:projectId/editor"
                      element={
                        <ProtectedRoute>
                          <EditorPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/studio/:projectId" element={<RedirectLegacyStudioProject />} />
                    <Route path="/timeline/:projectId" element={<RedirectLegacyTimelineProject />} />
                    <Route path="/timeline/:projectId/directors-cut" element={<RedirectLegacyDirectorsCut />} />
                    <Route path="/editor/:projectId" element={<RedirectLegacyEditorProject />} />
                    <Route path="/video-editor/:projectId" element={<RedirectLegacyEditorProject />} />
                    <Route path="/storyboard/:projectId" element={<RedirectProjectTimelineAlias />} />
                    <Route path="/project/:projectId/timeline" element={<RedirectProjectTimelineAlias />} />
                    <Route path={appRoutes.legacy.storyboardRoot} element={<Navigate to={appRoutes.home} replace />} />
                    <Route path={appRoutes.legacy.timelineRoot} element={<Navigate to={appRoutes.home} replace />} />
                    <Route path={appRoutes.legacy.editorRoot} element={<Navigate to={appRoutes.home} replace />} />
                    <Route
                      path="/credits"
                      element={
                        <ProtectedRoute>
                          <Navigate to={appRoutes.settings.billing} replace />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.settings.billing}
                      element={
                        <ProtectedRoute>
                          <SettingsBillingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.settings.billingDocs}
                      element={
                        <ProtectedRoute>
                          <SettingsBillingDocsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.storyboardGenerator}
                      element={
                        <ProtectedRoute>
                          <Storyboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shot-editor/:shotId"
                      element={
                        <ProtectedRoute>
                          <ShotEditor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={appRoutes.kanvas}
                      element={
                        <ProtectedRoute>
                          <KanvasPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </CursorLoadingProvider>
              </SidebarProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThirdwebProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
