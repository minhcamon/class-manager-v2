Hibernate: 
    select
        u1_0.id,
        u1_0.avatar_url,
        u1_0.created_at,
        u1_0.full_name,
        u1_0.google_email,
        u1_0.password_hash,
        u1_0.phone_number,
        u1_0.role,
        s1_0.id,
        s1_0.address,
        s1_0.created_at,
        s1_0.created_by,
        s1_0.name,
        s1_0.updated_at,
        u1_0.updated_at,
        u1_0.username
    from
        users u1_0
    left join
        schools s1_0
            on s1_0.id=u1_0.school_id
    where
        u1_0.id=?
Hibernate: 
    select
        u1_0.id,
        u1_0.avatar_url,
        u1_0.created_at,
        u1_0.full_name,
        u1_0.google_email,
        u1_0.password_hash,
        u1_0.phone_number,
        u1_0.role,
        s1_0.id,
        s1_0.address,
        s1_0.created_at,
        s1_0.created_by,
        s1_0.name,
        s1_0.updated_at,
        u1_0.updated_at,
        u1_0.username
    from
        users u1_0
    left join
        schools s1_0
            on s1_0.id=u1_0.school_id
    where
        u1_0.id=?
Hibernate: 
    select
        ce1_0.id,
        ce1_0.base_point,
        ce1_0.class_code,
        ce1_0.class_name,
        ce1_0.class_password,
        ce1_0.class_password_hash,
        ce1_0.created_at,
        ce1_0.grade,
        ce1_0.school_id,
        s1_0.id,
        s1_0.address,
        s1_0.created_at,
        s1_0.created_by,
        s1_0.name,
        s1_0.updated_at,
        ce1_0.status,
        ce1_0.teacher_id,
        t1_0.id,
        t1_0.avatar_url,
        t1_0.created_at,
        t1_0.full_name,
        t1_0.google_email,
        t1_0.password_hash,
        t1_0.phone_number,
        t1_0.role,
        t1_0.school_id,
        t1_0.updated_at,
        t1_0.username,
        ce1_0.updated_at
    from
        classes ce1_0
    join
        users t1_0
            on t1_0.id=ce1_0.teacher_id
    join
        schools s1_0
            on s1_0.id=ce1_0.school_id
    where
        ce1_0.id=?
Hibernate: 
    select
        ce1_0.id,
        ce1_0.base_point,
        ce1_0.class_code,
        ce1_0.class_name,
        ce1_0.class_password,
        ce1_0.class_password_hash,
        ce1_0.created_at,
        ce1_0.grade,
        ce1_0.school_id,
        s1_0.id,
        s1_0.address,
        s1_0.created_at,
        s1_0.created_by,
        s1_0.name,
        s1_0.updated_at,
        ce1_0.status,
        ce1_0.teacher_id,
        t1_0.id,
        t1_0.avatar_url,
        t1_0.created_at,
        t1_0.full_name,
        t1_0.google_email,
        t1_0.password_hash,
        t1_0.phone_number,
        t1_0.role,
        t1_0.school_id,
        t1_0.updated_at,
        t1_0.username,
        ce1_0.updated_at
    from
        classes ce1_0
    join
        users t1_0
            on t1_0.id=ce1_0.teacher_id
    join
        schools s1_0
            on s1_0.id=ce1_0.school_id
    where
        t1_0.id=?
        and ce1_0.status=?
Hibernate: 
    select
        count(e1_0.id)
    from
        enrollments e1_0
    where
        e1_0.class_id=?
        and e1_0.status=?
Hibernate: 
    select
        count(e1_0.id)
    from
        enrollments e1_0
    where
        e1_0.class_id=?
        and e1_0.status=?
Hibernate: 
    select
        ce1_0.id,
        ce1_0.base_point,
        ce1_0.class_code,
        ce1_0.class_name,
        ce1_0.class_password,
        ce1_0.class_password_hash,
        ce1_0.created_at,
        ce1_0.grade,
        ce1_0.school_id,
        s1_0.id,
        s1_0.address,
        s1_0.created_at,
        s1_0.created_by,
        s1_0.name,
        s1_0.updated_at,
        ce1_0.status,
        ce1_0.teacher_id,
        t1_0.id,
        t1_0.avatar_url,
        t1_0.created_at,
        t1_0.full_name,
        t1_0.google_email,
        t1_0.password_hash,
        t1_0.phone_number,
        t1_0.role,
        t1_0.school_id,
        t1_0.updated_at,
        t1_0.username,
        ce1_0.updated_at
    from
        classes ce1_0
    join
        users t1_0
            on t1_0.id=ce1_0.teacher_id
    join
        schools s1_0
            on s1_0.id=ce1_0.school_id
    where
        ce1_0.id=?
Hibernate: 
    select
        ce1_0.id,
        ce1_0.base_point,
        ce1_0.class_code,
        ce1_0.class_name,
        ce1_0.class_password,
        ce1_0.class_password_hash,
        ce1_0.created_at,
        ce1_0.grade,
        ce1_0.school_id,
        s1_0.id,
        s1_0.address,
        s1_0.created_at,
        s1_0.created_by,
        s1_0.name,
        s1_0.updated_at,
        ce1_0.status,
        ce1_0.teacher_id,
        t1_0.id,
        t1_0.avatar_url,
        t1_0.created_at,
        t1_0.full_name,
        t1_0.google_email,
        t1_0.password_hash,
        t1_0.phone_number,
        t1_0.role,
        t1_0.school_id,
        t1_0.updated_at,
        t1_0.username,
        ce1_0.updated_at
    from
        classes ce1_0
    join
        users t1_0
            on t1_0.id=ce1_0.teacher_id
    join
        schools s1_0
            on s1_0.id=ce1_0.school_id
    where
        t1_0.id=?
        and ce1_0.status=?
Hibernate:
    select
        e1_0.id,
        e1_0.class_id,
        e1_0.created_at,
        g1_0.id,
        g1_0.class_id,
        g1_0.created_at,
        g1_0.group_name,
        l1_0.id,
        l1_0.class_id,
        l1_0.created_at,
        l1_0.group_id,
        l1_0.status,
        sp2_0.id,
        sp2_0.created_at,
        sp2_0.data,
        sp2_0.enrollment_id,
        sp2_0.form_version_id,
        sp2_0.updated_at,
        l1_0.updated_at,
        l1_0.user_id,
        u2_0.id,
        u2_0.avatar_url,
        u2_0.created_at,
        u2_0.full_name,
        u2_0.google_email,
        u2_0.password_hash,
        u2_0.phone_number,
        u2_0.role,
        u2_0.school_id,
        u2_0.updated_at,
        u2_0.username,
        e1_0.status,
        sp1_0.id,
        sp1_0.created_at,
        sp1_0.data,
        sp1_0.enrollment_id,
        sp1_0.form_version_id,
        sp1_0.updated_at,
        e1_0.updated_at,
        e1_0.user_id,
        u1_0.id,
        u1_0.avatar_url,
        u1_0.created_at,
        u1_0.full_name,
        u1_0.google_email,
        u1_0.password_hash,
        u1_0.phone_number,
        u1_0.role,
        u1_0.school_id,
        u1_0.updated_at,
        u1_0.username
    from
        enrollments e1_0
    join
        users u1_0
            on u1_0.id=e1_0.user_id
    left join
        student_profiles sp1_0
            on e1_0.id=sp1_0.enrollment_id
    left join
        groups g1_0
            on g1_0.id=e1_0.group_id
    left join
        enrollments l1_0
            on l1_0.id=g1_0.leader_enrollment_id
    left join
        student_profiles sp2_0
            on l1_0.id=sp2_0.enrollment_id
    left join
        users u2_0
            on u2_0.id=l1_0.user_id
    where
        e1_0.class_id=?
        and e1_0.status=?
Hibernate: 
    select
        count(e1_0.id)
    from
        enrollments e1_0
    where
        e1_0.class_id=?
        and e1_0.status=?
Hibernate: 
    select
        g1_0.id,
        g1_0.class_id,
        g1_0.created_at,
        g1_0.group_name,
        l1_0.id,
        l1_0.class_id,
        l1_0.created_at,
        l1_0.group_id,
        l1_0.status,
        sp1_0.id,
        sp1_0.created_at,
        sp1_0.data,
        sp1_0.enrollment_id,
        sp1_0.form_version_id,
        sp1_0.updated_at,
        l1_0.updated_at,
        l1_0.user_id,
        u1_0.id,
        u1_0.avatar_url,
        u1_0.created_at,
        u1_0.full_name,
        u1_0.google_email,
        u1_0.password_hash,
        u1_0.phone_number,
        u1_0.role,
        u1_0.school_id,
        u1_0.updated_at,
        u1_0.username
    from
        groups g1_0
    left join
        enrollments l1_0
            on l1_0.id=g1_0.leader_enrollment_id
    left join
        student_profiles sp1_0
            on l1_0.id=sp1_0.enrollment_id
    left join
        users u1_0
            on u1_0.id=l1_0.user_id
    where
        g1_0.class_id=?
Hibernate:
    select
        count(e1_0.id)
    from
        enrollments e1_0
    where
        e1_0.class_id=?
        and e1_0.status=?
Hibernate: 
    select
        ce1_0.id,
        ce1_0.base_point,
        ce1_0.class_code,
        ce1_0.class_name,
        ce1_0.class_password,
        ce1_0.class_password_hash,
        ce1_0.created_at,
        ce1_0.grade,
        ce1_0.school_id,
        ce1_0.status,
        ce1_0.teacher_id,
        ce1_0.updated_at
    from
        classes ce1_0
    where
        ce1_0.id=?
        and ce1_0.teacher_id=?
Hibernate: 
    select
        ft1_0.id,
        ft1_0.class_id,
        ft1_0.created_at,
        ft1_0.is_active,
        ft1_0.structure,
        ft1_0.title,
        ft1_0.updated_at,
        ft1_0.version
    from
        form_templates ft1_0
    where
        ft1_0.class_id=?
        and ft1_0.is_active=true
Hibernate: 
    select
        g1_0.id,
        g1_0.class_id,
        g1_0.created_at,
        g1_0.group_name,
        l1_0.id,
        l1_0.class_id,
        l1_0.created_at,
        l1_0.group_id,
        l1_0.status,
        sp1_0.id,
        sp1_0.created_at,
        sp1_0.data,
        sp1_0.enrollment_id,
        sp1_0.form_version_id,
        sp1_0.updated_at,
        l1_0.updated_at,
        l1_0.user_id,
        u1_0.id,
        u1_0.avatar_url,
        u1_0.created_at,
        u1_0.full_name,
        u1_0.google_email,
        u1_0.password_hash,
        u1_0.phone_number,
        u1_0.role,
        u1_0.school_id,
        u1_0.updated_at,
        u1_0.username
    from
        groups g1_0
    left join
        enrollments l1_0
            on l1_0.id=g1_0.leader_enrollment_id
    left join
        student_profiles sp1_0
            on l1_0.id=sp1_0.enrollment_id
    left join
        users u1_0
            on u1_0.id=l1_0.user_id
    where
        g1_0.class_id=?
Hibernate: 
    select
        pl1_0.student_id,
        coalesce(sum(pl1_0.point_value), 0)
    from
        point_logs pl1_0
    where
        pl1_0.class_id=?
    group by
        pl1_0.student_id
Hibernate: 
    select
        e1_0.id,
        e1_0.class_id,
        e1_0.created_at,
        g1_0.id,
        g1_0.class_id,
        g1_0.created_at,
        g1_0.group_name,
        l1_0.id,
        l1_0.class_id,
        l1_0.created_at,
        l1_0.group_id,
        l1_0.status,
        sp2_0.id,
        sp2_0.created_at,
        sp2_0.data,
        sp2_0.enrollment_id,
        sp2_0.form_version_id,
        sp2_0.updated_at,
        l1_0.updated_at,
        l1_0.user_id,
        u2_0.id,
        u2_0.avatar_url,
        u2_0.created_at,
        u2_0.full_name,
        u2_0.google_email,
        u2_0.password_hash,
        u2_0.phone_number,
        u2_0.role,
        u2_0.school_id,
        u2_0.updated_at,
        u2_0.username,
        e1_0.status,
        sp1_0.id,
        sp1_0.created_at,
        sp1_0.data,
        sp1_0.enrollment_id,
        sp1_0.form_version_id,
        sp1_0.updated_at,
        e1_0.updated_at,
        e1_0.user_id,
        u1_0.id,
        u1_0.avatar_url,
        u1_0.created_at,
        u1_0.full_name,
        u1_0.google_email,
        u1_0.password_hash,
        u1_0.phone_number,
        u1_0.role,
        u1_0.school_id,
        u1_0.updated_at,
        u1_0.username
    from
        enrollments e1_0
    join
        users u1_0
            on u1_0.id=e1_0.user_id
    left join
        student_profiles sp1_0
            on e1_0.id=sp1_0.enrollment_id
    left join
        groups g1_0
            on g1_0.id=e1_0.group_id
    left join
        enrollments l1_0
            on l1_0.id=g1_0.leader_enrollment_id
    left join
        student_profiles sp2_0
            on l1_0.id=sp2_0.enrollment_id
    left join
        users u2_0
            on u2_0.id=l1_0.user_id
    where
        e1_0.class_id=?
        and e1_0.status=?
Hibernate: 
    select
        ce1_0.id,
        ce1_0.base_point,
        ce1_0.class_code,
        ce1_0.class_name,
        ce1_0.class_password,
        ce1_0.class_password_hash,
        ce1_0.created_at,
        ce1_0.grade,
        ce1_0.school_id,
        ce1_0.status,
        ce1_0.teacher_id,
        ce1_0.updated_at
    from
        classes ce1_0
    where
        ce1_0.id=?
        and ce1_0.teacher_id=?
Hibernate: 
    select
        ft1_0.id,
        ft1_0.class_id,
        ft1_0.created_at,
        ft1_0.is_active,
        ft1_0.structure,
        ft1_0.title,
        ft1_0.updated_at,
        ft1_0.version
    from
        form_templates ft1_0
    where
        ft1_0.class_id=?
        and ft1_0.is_active=true
Hibernate: 
    select
        pl1_0.student_id,
        coalesce(sum(pl1_0.point_value), 0)
    from
        point_logs pl1_0
    where
        pl1_0.class_id=?
    group by
        pl1_0.student_id
