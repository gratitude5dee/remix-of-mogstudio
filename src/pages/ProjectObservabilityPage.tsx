import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, RefreshCcw, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { appRoutes } from '@/lib/routes';
import { observabilityService, type ProjectObservabilityData } from '@/services/observabilityService';
import { toast } from 'sonner';

const dateLabel = (value?: string | null) => {
  if (!value) return 'n/a';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'n/a';
  return parsed.toLocaleString();
};

const scoreLabel = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'n/a';
  return value.toFixed(2);
};

const statusVariant = (status: string | null | undefined) => {
  switch (status) {
    case 'completed':
    case 'resolved':
    case 'clear':
    case 'executed':
      return 'default';
    case 'failed':
    case 'needs_revision':
      return 'destructive';
    case 'open':
    case 'in_review':
    case 'running':
    case 'processing':
    case 'queued':
    case 'needs_review':
    case 'proposed':
    case 'approved':
      return 'secondary';
    default:
      return 'outline';
  }
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <Card className="border-white/10 bg-black/20">
    <CardHeader>
      <CardTitle className="text-base text-white">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

const MetricCard = ({ title, value, note }: { title: string; value: string | number; note: string }) => (
  <Card className="border-white/10 bg-black/20">
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-2xl text-white">{value}</CardTitle>
    </CardHeader>
    <CardContent className="pt-0 text-sm text-muted-foreground">{note}</CardContent>
  </Card>
);

const ProjectObservabilityPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectObservabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!projectId) {
      navigate(appRoutes.home);
      return;
    }

    setIsLoading(true);
    try {
      const next = await observabilityService.getProjectObservability(projectId);
      setData(next);
    } catch (error) {
      console.error('Failed to load observability data', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load observability data');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const timelineItems = useMemo(() => {
    if (!data) return [];

    return [
      ...data.generationJobs.map((job) => ({
        id: `generation-${job.id}`,
        type: 'generation',
        created_at: job.created_at,
        status: job.status,
        label: `${job.job_type} job`,
        detail: job.model_id || job.external_request_id || 'generation',
      })),
      ...data.evaluationRuns.map((run) => ({
        id: `evaluation-${run.id}`,
        type: 'evaluation',
        created_at: run.created_at,
        status: run.status,
        label: `${run.target_type || 'target'} evaluation`,
        detail: run.rubric_version || run.mode || 'shadow',
      })),
    ].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  }, [data]);

  const submitReview = useCallback(
    async (taskId: string, feedbackType: 'approve' | 'reject' | 'annotate', targetType: 'storyline' | 'scene' | 'shot' | 'character', targetId: string) => {
      if (!projectId) return;

      setIsSubmitting(taskId);
      try {
        await observabilityService.submitReviewEvent({
          projectId,
          reviewTaskId: taskId,
          targetType,
          targetId,
          feedbackType,
          note: notes[taskId] || undefined,
          rejectionReasonCodes:
            feedbackType === 'reject'
              ? (tags[taskId] || '')
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : [],
        });
        toast.success(`Review ${feedbackType} recorded`);
        await load();
      } catch (error) {
        console.error('Failed to submit review event', error);
        toast.error(error instanceof Error ? error.message : 'Failed to submit review event');
      } finally {
        setIsSubmitting(null);
      }
    },
    [load, notes, projectId, tags]
  );

  if (!projectId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-foreground">
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(appRoutes.projects.timeline(projectId))}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Timeline
              </Button>
              <Badge variant="secondary">Shadow Evaluation</Badge>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              {data?.projectTitle || 'Project'} observability
            </h1>
            <p className="text-sm text-muted-foreground">
              Project-scoped evaluation runs, review queues, revision plans, and lineage.
            </p>
          </div>

          <Button variant="outline" onClick={() => void load()} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {isLoading && !data ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading project observability…
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-black/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
              <TabsTrigger value="judges">Judges</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="revision">Revision</TabsTrigger>
              <TabsTrigger value="narrative">Narrative</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Open Review Tasks" value={data?.overview.openReviewTasks ?? 0} note="Human attention required." />
                <MetricCard title="Pending Revision Plans" value={data?.overview.pendingRevisions ?? 0} note="Auto-drafted corrective actions." />
                <MetricCard title="Completed Evaluations" value={data?.overview.completedEvaluations ?? 0} note="Shadow judge runs persisted." />
                <MetricCard title="Active Eval Jobs" value={data?.overview.activeEvaluationJobs ?? 0} note="Queued or processing evaluation/revision jobs." />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">Attention hotspots</CardTitle>
                    <CardDescription>Where the shadow system is flagging work right now.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Shots needing review</span>
                      <Badge variant="secondary">{data?.overview.needsAttentionShots ?? 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Scenes needing review</span>
                      <Badge variant="secondary">{data?.overview.needsAttentionScenes ?? 0}</Badge>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Failed judge families</p>
                      <div className="flex flex-wrap gap-2">
                        {data?.overview.failedJudgeFamilies.length ? (
                          data.overview.failedJudgeFamilies.map((family) => (
                            <Badge key={family} variant="destructive">
                              {family}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No current failures</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">Thresholds</CardTitle>
                    <CardDescription>Project-level shadow escalation thresholds.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Storyline</p>
                      <p className="text-white">{scoreLabel(data?.thresholds.storyline)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Continuity</p>
                      <p className="text-white">{scoreLabel(data?.thresholds.continuity)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Character consistency</p>
                      <p className="text-white">{scoreLabel(data?.thresholds.character_consistency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Canon compliance</p>
                      <p className="text-white">{scoreLabel(data?.thresholds.canon_compliance)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Max disagreement</p>
                      <p className="text-white">{scoreLabel(data?.thresholds.max_disagreement)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="runs" className="space-y-4">
              {timelineItems.length === 0 ? (
                <EmptyState title="No runs yet" description="Generation and evaluation runs will appear here once the storyboard pipeline starts emitting observability data." />
              ) : (
                timelineItems.map((item) => (
                  <Card key={item.id} className="border-white/10 bg-black/20">
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant(item.status)}>{item.status || 'unknown'}</Badge>
                          <span className="text-sm uppercase tracking-wide text-muted-foreground">{item.type}</span>
                        </div>
                        <p className="mt-2 text-sm text-white">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">{dateLabel(item.created_at)}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="judges" className="space-y-4">
              {!data?.evaluationRuns.length ? (
                <EmptyState title="No judge output yet" description="Completed evaluation runs will expose criterion scores, disagreement, and evidence here." />
              ) : (
                data.evaluationRuns.map((run) => (
                  <Card key={run.id} className="border-white/10 bg-black/20">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base text-white">
                            {run.target_type || 'target'} · {run.target_id?.slice(0, 8) || 'unknown'}
                          </CardTitle>
                          <CardDescription>
                            {run.mode || 'shadow'} · {run.rubric_version || 'rubric pending'} · {dateLabel(run.created_at)}
                          </CardDescription>
                        </div>
                        <Badge variant={statusVariant(run.status)}>{run.status || 'unknown'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Aggregates</p>
                          <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-zinc-200">
                            {JSON.stringify(run.aggregates ?? {}, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Disagreement</p>
                          <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-zinc-200">
                            {JSON.stringify(run.disagreement ?? {}, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Reliability snapshot</p>
                          <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-zinc-200">
                            {JSON.stringify(run.reliability_snapshot ?? {}, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(data.evaluationResultsByRun[run.id] ?? []).map((result) => (
                          <div key={result.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-white">{result.judge_type || 'judge'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(result.judge_model || 'unknown').toString()} · {result.judge_model_version || 'v1'}
                                </p>
                              </div>
                              <div className="text-right text-sm text-white">
                                {scoreLabel(result.score)} / {scoreLabel(result.confidence)}
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(result.failure_tags ?? []).map((tag) => (
                                <Badge key={tag} variant="destructive">
                                  {tag}
                                </Badge>
                              ))}
                              {result.likert_label ? <Badge variant="outline">{result.likert_label}</Badge> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              {!data?.reviewTasks.length ? (
                <EmptyState title="No review tasks" description="Threshold failures create review queue items here. Older projects stay empty until evaluated." />
              ) : (
                data.reviewTasks.map((task) => (
                  <Card key={task.id} className="border-white/10 bg-black/20">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base text-white">
                            {task.target_type} · {task.target_id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription>{task.summary || 'Manual review required'}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                          {task.blocking ? <Badge variant="destructive">blocking</Badge> : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Textarea
                          value={notes[task.id] ?? ''}
                          onChange={(event) => setNotes((prev) => ({ ...prev, [task.id]: event.target.value }))}
                          placeholder="Reviewer note"
                          className="min-h-24 bg-black/30"
                        />
                        <Input
                          value={tags[task.id] ?? ''}
                          onChange={(event) => setTags((prev) => ({ ...prev, [task.id]: event.target.value }))}
                          placeholder="reject tags, comma separated"
                          className="bg-black/30"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={isSubmitting === task.id}
                          onClick={() =>
                            void submitReview(task.id, 'approve', task.target_type as 'character' | 'scene' | 'shot' | 'storyline', task.target_id)
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isSubmitting === task.id}
                          onClick={() =>
                            void submitReview(task.id, 'reject', task.target_type, task.target_id)
                          }
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSubmitting === task.id}
                          onClick={() =>
                            void submitReview(task.id, 'annotate', task.target_type, task.target_id)
                          }
                        >
                          {isSubmitting === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Save note
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {data?.reviewEvents.length ? (
                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">Recent review events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.reviewEvents.slice(0, 12).map((event) => (
                      <div key={event.id} className="flex items-start justify-between gap-3 rounded-md border border-white/10 px-3 py-2">
                        <div>
                          <p className="text-sm text-white">
                            {event.feedback_type} · {event.target_type} · {event.target_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.note || 'No note'}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{dateLabel(event.created_at)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="revision" className="space-y-4">
              {!data?.revisionPlans.length ? (
                <EmptyState title="No revision plans" description="Rejected review tasks or failing evaluations will materialize revision plans here." />
              ) : (
                data.revisionPlans.map((plan) => (
                  <Card key={plan.id} className="border-white/10 bg-black/20">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base text-white">
                            {plan.target_type} · {plan.target_id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription>{dateLabel(plan.created_at)}</CardDescription>
                        </div>
                        <Badge variant={statusVariant(plan.status)}>{plan.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                      <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-zinc-200">
                        {JSON.stringify(plan.trigger ?? {}, null, 2)}
                      </pre>
                      <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-zinc-200">
                        {JSON.stringify(plan.actions ?? [], null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="narrative" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">Narrative atoms</CardTitle>
                    <CardDescription>Scene-level planned beats used for storyline observability.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!data?.narrativeAtoms.length ? (
                      <div className="text-sm text-muted-foreground">No narrative atoms persisted yet.</div>
                    ) : (
                      data.narrativeAtoms.map((atom) => (
                        <div key={atom.id} className="rounded-md border border-white/10 p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{atom.beat_type}</Badge>
                            {atom.is_blocking ? <Badge variant="destructive">blocking</Badge> : null}
                          </div>
                          <p className="mt-2 text-sm text-white">{atom.description}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">Story events</CardTitle>
                    <CardDescription>Persistent narrative memory written from generated story structure.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!data?.storyEvents.length ? (
                      <div className="text-sm text-muted-foreground">No story events persisted yet.</div>
                    ) : (
                      data.storyEvents.map((event) => (
                        <div key={event.id} className="rounded-md border border-white/10 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-white">{event.description}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{dateLabel(event.created_at)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(event.participants ?? []).map((participant) => (
                              <Badge key={participant} variant="secondary">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ProjectObservabilityPage;
