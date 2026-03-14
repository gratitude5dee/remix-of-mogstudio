import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { errorResponse, handleCors, successResponse } from '../_shared/response.ts';
import { getBillingMode } from '../_shared/billing.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const user = await authenticateRequest(req.headers);
    const mode = getBillingMode();

    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );

    const { data: plans, error: plansError } = await userClient
      .from('billing_plans')
      .select('plan_code, display_name, description, monthly_price_cents, yearly_price_cents, monthly_quota, rollover_cap, stripe_price_monthly_id, stripe_price_yearly_id, metadata, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (plansError) {
      throw plansError;
    }

    const { data: packs, error: packsError } = await userClient
      .from('billing_credit_packs')
      .select('pack_code, display_name, credits, price_cents, stripe_price_id, metadata, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (packsError) {
      throw packsError;
    }

    const { data: subscription } = await userClient
      .from('billing_subscriptions')
      .select('plan_code, status, cancel_at_period_end, current_period_start, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: balance, error: balanceError } = await (userClient as any).rpc('credits_get_balance');
    if (balanceError) {
      throw balanceError;
    }

    return successResponse({
      success: true,
      billing_mode: mode,
      checkout_available: mode !== 'disabled',
      plans: plans || [],
      credit_packs: packs || [],
      subscription: subscription || null,
      wallet: balance?.wallet ?? null,
      plan: balance?.plan ?? null,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
});
