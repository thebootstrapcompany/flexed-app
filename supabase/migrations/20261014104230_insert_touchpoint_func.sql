-- Remove the function to avoid overload conflicts
DROP FUNCTION IF EXISTS public.activate_touchpoint(
    text, text, text, text, text
);

CREATE OR REPLACE FUNCTION public.activate_touchpoint(
    p_code       text,
    p_name       text,
    p_email      text DEFAULT NULL,
    p_phone      text DEFAULT NULL,
    p_url        text DEFAULT NULL,
    p_review_url text DEFAULT NULL
)
RETURNS TABLE (
    code    text,
    user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id    uuid;
    v_code       text;
    v_review_url text;
BEGIN
    v_user_id := (SELECT auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION
            'Please sign in to activate this Touchpoint.';
    END IF;

    IF NULLIF(TRIM(p_code), '') IS NULL THEN
        RAISE EXCEPTION 'Invalid Touchpoint code.';
    END IF;

    IF NULLIF(TRIM(p_name), '') IS NULL THEN
        RAISE EXCEPTION 'Business name is required.';
    END IF;

    v_review_url := NULLIF(TRIM(p_review_url), '');
    IF v_review_url IS NOT NULL AND (
        v_review_url !~ '^https://search\.google\.com/local/writereview\?placeid=[A-Za-z0-9_-]+$'
    ) THEN
        RAISE EXCEPTION 'Invalid Google review URL.';
    END IF;

    SELECT t.code
    INTO v_code
    FROM public.touchpoints AS t
    WHERE t.code = TRIM(p_code)
      AND t.status = 'inactive'
    FOR UPDATE;
    IF v_code IS NULL THEN
        RAISE EXCEPTION
            'Touchpoint is invalid or already activated.';
    END IF;

    INSERT INTO public.businesses (
        code,
        user_id,
        name,
        email,
        phone,
        links,
        metadata
    )
    VALUES (
        v_code,
        v_user_id,
        TRIM(p_name),
        NULLIF(TRIM(p_email), ''),
        NULLIF(TRIM(p_phone), ''),
        jsonb_build_object(
            'maps', COALESCE(TRIM(p_url), ''),
            'reviews', COALESCE(v_review_url, '')
        ),
        jsonb_build_object(
            'desc', '',
            'bg_path', '',
            'hero_path', '',
            'automation', jsonb_build_object(
                'tone', 'Balanced',
                'language', 'English',
                'length', 'Short',
                'instructions', ''
            )
        )
    );

    -- 6. Activate Touchpoint
    UPDATE public.touchpoints AS t
    SET
        status = 'active',
        updated_at = NOW()
    WHERE t.code = v_code
      AND t.status = 'inactive';

    -- 7. Return activated Touchpoint
    RETURN QUERY
    SELECT v_code, v_user_id;
END;
$$;

-- Restrict function execution
REVOKE ALL ON FUNCTION public.activate_touchpoint(text, text, text, text, text, text) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.activate_touchpoint(text, text, text, text, text, text) FROM anon;

GRANT EXECUTE ON FUNCTION public.activate_touchpoint(text, text, text, text, text, text) TO authenticated;