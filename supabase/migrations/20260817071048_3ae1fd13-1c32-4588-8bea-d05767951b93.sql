insert into public.user_roles (user_id, role) values
('29074fdc-8205-470c-a6ad-8a56376ead2a','reseller'),
('a216743b-11dd-44df-b548-dcef255c829b','boss')
on conflict (user_id, role) do nothing;