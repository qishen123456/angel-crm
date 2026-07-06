create extension if not exists pgcrypto;

create table if not exists markets (
    code varchar(8) primary key,
    name_en varchar(64) not null,
    name_zh varchar(64),
    region varchar(32),
    is_active boolean not null default true,
    is_builtin boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists users (
    id varchar(32) primary key,
    email varchar(255) not null unique,
    name_en varchar(128) not null,
    name_zh varchar(128),
    department varchar(64),
    permission_code varchar(64) not null,
    status varchar(32) not null,
    lang_pref varchar(16),
    manager_id varchar(32) references users(id),
    specialisation text,
    is_system boolean not null default false,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists user_market_scopes (
    user_id varchar(32) not null references users(id) on delete cascade,
    market_code varchar(8) not null references markets(code),
    primary key (user_id, market_code)
);

create table if not exists accounts (
    id varchar(32) primary key,
    code varchar(32) not null unique,
    name varchar(255) not null,
    market_code varchar(8) references markets(code),
    owner_id varchar(32) references users(id),
    marketing_owner_id varchar(32) references users(id),
    annual_target_usd numeric(18,2),
    year_to_date_usd numeric(18,2),
    contract_status varchar(32),
    contract_expires_at timestamptz,
    business_type varchar(32),
    customer_country varchar(8),
    opportunity_notes text,
    customer_resources text,
    next_dig_directions text,
    landmark_case_status varchar(32),
    pooled_at timestamptz,
    pooled_reason varchar(64),
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists account_payment_profiles (
    account_id varchar(32) primary key references accounts(id) on delete cascade,
    bank_name varchar(255),
    bank_account_number varchar(128),
    account_holder varchar(255),
    swift_code varchar(64),
    currency varchar(16),
    bank_address text,
    tax_id varchar(128),
    added_by_id varchar(32) references users(id),
    added_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists account_contacts (
    id varchar(32) primary key,
    account_id varchar(32) not null references accounts(id) on delete cascade,
    name_en varchar(128) not null,
    name_zh varchar(128),
    title varchar(128),
    email varchar(255),
    phone varchar(64),
    wechat varchar(128),
    whatsapp varchar(128),
    is_primary boolean not null default false,
    notes text,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists campaigns (
    id varchar(32) primary key,
    code varchar(64) not null unique,
    name varchar(255) not null,
    campaign_type varchar(64),
    status varchar(32),
    market_code varchar(8) references markets(code),
    start_date date,
    end_date date,
    budget_usd numeric(18,2),
    actual_spend_usd numeric(18,2),
    owner_id varchar(32) references users(id),
    objective text,
    rollup_lead_count integer,
    rollup_converted_account_count integer,
    rollup_opportunity_value_usd numeric(18,2),
    notes text,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists campaign_channels (
    id uuid primary key default gen_random_uuid(),
    campaign_id varchar(32) not null references campaigns(id) on delete cascade,
    channel_name varchar(128) not null
);

create table if not exists leads (
    id varchar(32) primary key,
    name_en varchar(128) not null,
    name_zh varchar(128),
    title varchar(128),
    company_name varchar(255) not null,
    customer_country varchar(8),
    email varchar(255),
    phone varchar(64),
    whatsapp varchar(128),
    status varchar(32) not null,
    source varchar(64),
    campaign_id varchar(32) references campaigns(id),
    rating integer,
    estimated_value_usd numeric(18,2),
    product_interest varchar(64),
    owner_id varchar(32) references users(id),
    last_contacted_at timestamptz,
    notes text,
    converted_account_id varchar(32) references accounts(id),
    converted_contact_id varchar(32) references account_contacts(id),
    converted_opportunity_id varchar(32),
    converted_at timestamptz,
    lost_reason text,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists opportunities (
    id varchar(32) primary key,
    account_id varchar(32) not null references accounts(id) on delete cascade,
    product_line varchar(64),
    deal_type varchar(64),
    stage varchar(16) not null,
    expected_value_usd numeric(18,2),
    owner_id varchar(32) references users(id),
    last_activity_at timestamptz,
    expected_close_date timestamptz,
    won_at timestamptz,
    lost_at timestamptz,
    lost_reason varchar(128),
    lost_notes text,
    contract_no_snapshot varchar(128),
    commercial_grade varchar(16),
    commercial_grade_reason text,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'fk_leads_converted_opportunity'
    ) then
        alter table leads
            add constraint fk_leads_converted_opportunity
            foreign key (converted_opportunity_id) references opportunities(id);
    end if;
end
$$;

create table if not exists opportunity_activities (
    id varchar(32) primary key,
    opportunity_id varchar(32) not null references opportunities(id) on delete cascade,
    activity_type varchar(64) not null,
    summary text not null,
    next_action text,
    logged_by_id varchar(32) references users(id),
    logged_at timestamptz not null,
    scheduled_for timestamptz,
    source_daily_report_id varchar(32),
    created_at timestamptz not null default now()
);

create table if not exists contracts (
    id varchar(32) primary key,
    opportunity_id varchar(32) not null references opportunities(id) on delete cascade,
    account_id varchar(32) references accounts(id),
    contract_no varchar(128) not null unique,
    value_usd numeric(18,2),
    feishu_payment_status varchar(32),
    expiry_date timestamptz,
    contract_type varchar(64),
    sign_status varchar(32),
    value_original_currency varchar(16),
    value_original numeric(18,2),
    effective_date timestamptz,
    duration_years integer,
    owning_entity varchar(64),
    rollup_ordered_usd numeric(18,2),
    rollup_collected_usd numeric(18,2),
    rollup_shipped_usd numeric(18,2),
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists products (
    id varchar(32) primary key,
    sku varchar(64) not null unique,
    name_en varchar(255) not null,
    name_zh varchar(255),
    product_line varchar(64),
    category varchar(64),
    description text,
    spec text,
    unit_price_usd numeric(18,2),
    lead_time_days integer,
    availability varchar(32),
    status varchar(32),
    is_strategic boolean not null default false,
    strategic_reason text,
    updated_at timestamptz
);

create table if not exists orders (
    id varchar(32) primary key,
    order_number varchar(64) not null unique,
    account_id varchar(32) not null references accounts(id),
    requested_by_id varchar(32) references users(id),
    contract_id varchar(32) references contracts(id),
    status varchar(32) not null,
    subtotal_usd numeric(18,2),
    pi_number varchar(128),
    pi_issued_at timestamptz,
    order_type varchar(64),
    payment_terms varchar(64),
    notes text,
    po_file_name varchar(255),
    po_file_url text,
    po_received_at timestamptz,
    shipped_at timestamptz,
    customs_declared_at timestamptz,
    shipped_declared_value_usd numeric(18,2),
    pi_overrides jsonb,
    shipment_batches jsonb,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id varchar(32) not null references orders(id) on delete cascade,
    product_id varchar(32) references products(id),
    product_sku varchar(64),
    product_name_en varchar(255),
    quantity integer not null,
    unit_price_usd numeric(18,2) not null,
    line_total_usd numeric(18,2) not null
);

create table if not exists payment_plans (
    id varchar(32) primary key,
    order_id varchar(32) not null references orders(id) on delete cascade,
    account_id varchar(32) not null references accounts(id),
    total_due_usd numeric(18,2),
    currency varchar(16),
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists payment_plan_lines (
    id varchar(32) primary key,
    payment_plan_id varchar(32) not null references payment_plans(id) on delete cascade,
    stage varchar(64),
    planned_date timestamptz,
    planned_amount_usd numeric(18,2),
    received_amount_usd numeric(18,2),
    status varchar(32)
);

create table if not exists payments (
    id varchar(32) primary key,
    order_id varchar(32) references orders(id),
    account_id varchar(32) references accounts(id),
    contract_id varchar(32) references contracts(id),
    amount_usd numeric(18,2),
    currency varchar(16),
    status varchar(32),
    received_at timestamptz,
    confirmed_at timestamptz,
    proof_file_name varchar(255),
    proof_file_url text,
    receipt_file_name varchar(255),
    receipt_file_url text,
    reference_no varchar(128),
    note text,
    raw_payload jsonb,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists invoice_requests (
    id varchar(32) primary key,
    order_id varchar(32) references orders(id),
    account_id varchar(32) references accounts(id),
    contract_id varchar(32) references contracts(id),
    requested_by_id varchar(32) references users(id),
    status varchar(32) not null,
    invoice_type varchar(64),
    amount numeric(18,2),
    currency varchar(16),
    tax_number varchar(128),
    billing_title varchar(255),
    billing_address text,
    note text,
    raw_payload jsonb,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists project_updates (
    id varchar(32) primary key,
    account_id varchar(32) not null references accounts(id) on delete cascade,
    posted_by_id varchar(32) references users(id),
    stage varchar(64),
    summary text not null,
    units_installed integer,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists end_users (
    id varchar(32) primary key,
    opportunity_id varchar(32) not null references opportunities(id) on delete cascade,
    site_name varchar(255) not null,
    product_type varchar(64),
    unit_count integer,
    install_status varchar(32),
    reminder_count integer,
    installed_at timestamptz,
    last_reminder_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists document_templates (
    id varchar(32) primary key,
    template_type varchar(64) not null,
    name varchar(255) not null,
    description text,
    file_name varchar(255),
    uploaded_by_id varchar(32) references users(id),
    uploaded_at timestamptz,
    is_active boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists account_documents (
    id varchar(32) primary key,
    account_id varchar(32) not null references accounts(id) on delete cascade,
    document_type varchar(64),
    name varchar(255) not null,
    file_name varchar(255),
    file_url text,
    uploaded_by_id varchar(32) references users(id),
    uploaded_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists daily_reports (
    id varchar(32) primary key,
    user_id varchar(32) not null references users(id) on delete cascade,
    report_date date not null,
    today_summary text,
    tomorrow_plan text,
    revenue_update_note text,
    blockers text,
    escalation_notes text,
    escalation_priority varchar(32),
    mood_rating integer,
    submitted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, report_date)
);

create table if not exists daily_report_accounts (
    daily_report_id varchar(32) not null references daily_reports(id) on delete cascade,
    account_id varchar(32) not null references accounts(id),
    relation_type varchar(32) not null default 'contacted',
    primary key (daily_report_id, account_id, relation_type)
);

create table if not exists notifications (
    id varchar(32) primary key,
    user_id varchar(32) references users(id),
    target_role varchar(64),
    event_type varchar(64),
    title_en varchar(255),
    title_zh varchar(255),
    body_en text,
    body_zh text,
    link text,
    entity_type varchar(64),
    entity_id varchar(32),
    is_read boolean not null default false,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_user_id varchar(32) references users(id),
    action varchar(128) not null,
    entity_type varchar(64),
    entity_id varchar(32),
    summary text not null,
    detail_json jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_accounts_owner_id on accounts(owner_id);
create index if not exists idx_accounts_market_code on accounts(market_code);
create index if not exists idx_leads_owner_id on leads(owner_id);
create index if not exists idx_opportunities_account_id on opportunities(account_id);
create index if not exists idx_opportunities_owner_id on opportunities(owner_id);
create index if not exists idx_opportunities_stage on opportunities(stage);
create index if not exists idx_opportunity_activities_opportunity_id on opportunity_activities(opportunity_id);
create index if not exists idx_contracts_account_id on contracts(account_id);
create index if not exists idx_orders_account_id on orders(account_id);
create index if not exists idx_orders_contract_id on orders(contract_id);
create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_project_updates_account_id on project_updates(account_id);
create index if not exists idx_end_users_opportunity_id on end_users(opportunity_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);
