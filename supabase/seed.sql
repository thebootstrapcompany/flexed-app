INSERT INTO public.plans (
    name,
    amount,
    duration_days,
    status,
    badge,
    features,
    limits
)
VALUES (
    'Beverage',
    0,
    null,
    'active',
    'free',
    '{
        "user_analytics": true,
        "business_analytics": true,
        "touchpoint_analytics": false,
        "catalogue": false,
        "anon_messages": false,
        "automated_replies": false,
        "review_suggestions": false,
        "seo_optimization": false
    }'::jsonb,
    '{}'::jsonb
)