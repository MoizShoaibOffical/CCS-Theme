(() => {
	// Early redirect for legacy server routes to prevent "Page dash not found"
	try {
		const p0 = location.pathname.replace(/\/$/, '');
		const m0 = p0.match(/^\/(?:app\/)?dash\/(.+)$/);
		if (m0 && m0[1]) {
			const role = decodeURIComponent(m0[1]);
			location.replace('/app#dash/' + encodeURIComponent(role));
		}
	} catch (e) {}
	function applyThemeVars(settings) {
		if (!settings) return;
		const root = document.documentElement;
		const entries = {
			"--nt-bg": settings.bg_color,
			"--nt-surface": settings.surface_color,
			"--nt-surface-2": settings.surface2_color,
			"--nt-text": settings.text_color,
			"--nt-text-dim": settings.text_dim_color,
			"--nt-primary": settings.primary_color,
			"--nt-primary-contrast": settings.on_primary_color,
			"--nt-accent": settings.accent_color,
			"--nt-radius-xs": settings.radius_xs,
			"--nt-radius-sm": settings.radius_sm,
			"--nt-radius-md": settings.radius_md,
			"--nt-radius-lg": settings.radius_lg,
		};
		Object.entries(entries).forEach(([k, v]) => {
			if (v) root.style.setProperty(k, String(v));
		});
	}

	function getBootSettings() {
		const boot = window.frappe?.boot || {};
		return boot.new_theme_settings || null;
	}

	function ready(fn) {
		if (document.readyState === "complete" || document.readyState === "interactive") {
			setTimeout(fn, 0);
		} else {
			document.addEventListener("DOMContentLoaded", fn, { once: true });
		}
	}

	// Utility: close "Not found" dialog that may flash during legacy route redirects
	function closeNotFoundDialog() {
		try {
			const shouldClose = (txt) => /not\s*found/i.test(txt) && /dash/i.test(txt);
			document.querySelectorAll('.modal, .msgprint, .frappe-error').forEach((m) => {
				const t = (m.textContent || '').trim();
				if (shouldClose(t)) {
					m.querySelector('.btn-close, .modal-header .close, .modal .close')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
					m.remove();
				}
			});
		} catch (e) {}
	}

	ready(() => {
		applyThemeVars(getBootSettings());
		// If a legacy route briefly triggered a Not Found modal, close it silently
		setTimeout(closeNotFoundDialog, 0);
		// Re-apply on desk refresh (route changes)
		document.addEventListener("page-change", () => applyThemeVars(getBootSettings()));
		// Enforce default density on load
		document.body.classList.remove('nt-density-compact', 'nt-density-touch');
		try { localStorage.removeItem('nt:density'); } catch (e) {}

		// Lightweight dashboard router: #dash/<role>
		const roleDashConfig = {
			"Sales Manager": {
				kpis: [
					{ label: 'Quotations (Draft)', doctype: 'Quotation', filters: { docstatus: 0 } },
					{ label: 'Sales Orders (Draft)', doctype: 'Sales Order', filters: { docstatus: 0 } },
					{ label: 'Sales Invoices (Draft)', doctype: 'Sales Invoice', filters: { docstatus: 0 } },
				],
				shortcuts: [
					{ label: 'New Quotation', doctype: 'Quotation' },
					{ label: 'New Sales Order', doctype: 'Sales Order' },
					{ label: 'New Sales Invoice', doctype: 'Sales Invoice' }
				]
			},
			"Purchase Manager": {
				kpis: [
					{ label: 'Purchase Orders (Draft)', doctype: 'Purchase Order', filters: { docstatus: 0 } },
					{ label: 'Purchase Invoices (Draft)', doctype: 'Purchase Invoice', filters: { docstatus: 0 } },
					{ label: 'Supplier Quotations (Draft)', doctype: 'Supplier Quotation', filters: { docstatus: 0 } }
				],
				shortcuts: [
					{ label: 'New Supplier', doctype: 'Supplier' },
					{ label: 'New Purchase Order', doctype: 'Purchase Order' },
					{ label: 'New Purchase Invoice', doctype: 'Purchase Invoice' }
				]
			},
			"Stock Manager": {
				kpis: [
					{ label: 'Open Delivery Notes', doctype: 'Delivery Note', filters: { docstatus: 0 } },
					{ label: 'Stock Entries (Draft)', doctype: 'Stock Entry', filters: { docstatus: 0 } },
					{ label: 'Items', doctype: 'Item', filters: {} }
				],
				shortcuts: [
					{ label: 'New Item', doctype: 'Item' },
					{ label: 'New Delivery Note', doctype: 'Delivery Note' },
					{ label: 'New Stock Entry', doctype: 'Stock Entry' }
				]
			}
			,
			"Sales User": {
				kpis: [ { label: 'My Quotations', doctype: 'Quotation', filters: { owner: frappe.session && frappe.session.user } }, { label: 'My Sales Orders', doctype: 'Sales Order', filters: { owner: frappe.session && frappe.session.user } } ],
				shortcuts: [ { label: 'New Quotation', doctype: 'Quotation' }, { label: 'New Sales Order', doctype: 'Sales Order' } ]
			},
			"Purchase Manager": { /* existing */ },
			"Purchase User": {
				kpis: [ { label: 'My Purchase Orders', doctype: 'Purchase Order', filters: { owner: frappe.session && frappe.session.user } }, { label: 'Draft Purchase Invoices', doctype: 'Purchase Invoice', filters: { docstatus: 0 } } ],
				shortcuts: [ { label: 'New Purchase Order', doctype: 'Purchase Order' }, { label: 'New Purchase Invoice', doctype: 'Purchase Invoice' } ]
			},
			"Accounts Manager": { kpis: [ { label: 'Unpaid Invoices', doctype: 'Sales Invoice', filters: { outstanding_amount: ['>', 0] } }, { label: 'Payable Invoices', doctype: 'Purchase Invoice', filters: { outstanding_amount: ['>', 0] } } ], shortcuts: [ { label: 'New Journal Entry', doctype: 'Journal Entry' } ] },
			"Accounts User": { kpis: [ { label: 'Payment Entries', doctype: 'Payment Entry', filters: {} } ], shortcuts: [ { label: 'New Payment Entry', doctype: 'Payment Entry' } ] },
			"HR Manager": { kpis: [ { label: 'Open Leaves', doctype: 'Leave Application', filters: { status: 'Open' } }, { label: 'Pending Appraisals', doctype: 'Appraisal', filters: { status: 'Draft' } } ], shortcuts: [ { label: 'New Employee', doctype: 'Employee' }, { label: 'New Leave Application', doctype: 'Leave Application' } ] },
			"HR User": { kpis: [ { label: 'My Leaves', doctype: 'Leave Application', filters: { owner: frappe.session && frappe.session.user } } ], shortcuts: [ { label: 'Apply Leave', doctype: 'Leave Application' } ] },
			"Projects Manager": { kpis: [ { label: 'Open Projects', doctype: 'Project', filters: { status: 'Open' } }, { label: 'Open Tasks', doctype: 'Task', filters: { status: 'Open' } } ], shortcuts: [ { label: 'New Project', doctype: 'Project' }, { label: 'New Task', doctype: 'Task' } ] },
			"Projects User": { kpis: [ { label: 'My Tasks', doctype: 'Task', filters: { status: 'Open', owner: frappe.session && frappe.session.user } } ], shortcuts: [ { label: 'New Task', doctype: 'Task' } ] },
			"Manufacturing Manager": { kpis: [ { label: 'Open Work Orders', doctype: 'Work Order', filters: { status: 'Not Started' } } ], shortcuts: [ { label: 'New Work Order', doctype: 'Work Order' } ] },
			"Manufacturing User": { kpis: [ { label: 'In Progress Work Orders', doctype: 'Work Order', filters: { status: 'In Process' } } ], shortcuts: [ { label: 'New Job Card', doctype: 'Job Card' } ] },
			"Stock Manager": { /* existing */ },
			"Stock User": { kpis: [ { label: 'My Stock Entries', doctype: 'Stock Entry', filters: { owner: frappe.session && frappe.session.user } } ], shortcuts: [ { label: 'New Stock Entry', doctype: 'Stock Entry' } ] },
			"Support Team": { kpis: [ { label: 'Open Issues', doctype: 'Issue', filters: { status: 'Open' } } ], shortcuts: [ { label: 'New Issue', doctype: 'Issue' } ] },
			"Delivery Manager": { kpis: [ { label: 'Pending Deliveries', doctype: 'Delivery Note', filters: { docstatus: 0 } } ], shortcuts: [ { label: 'New Delivery Note', doctype: 'Delivery Note' } ] },
			"Delivery User": { kpis: [ { label: 'My Deliveries (Draft)', doctype: 'Delivery Note', filters: { owner: frappe.session && frappe.session.user, docstatus: 0 } } ], shortcuts: [ { label: 'New Delivery Note', doctype: 'Delivery Note' } ] },
			"Customer": { kpis: [ { label: 'My Quotations', doctype: 'Quotation', filters: { owner: frappe.session && frappe.session.user } } ], shortcuts: [] },
			"Supplier": { kpis: [ { label: 'My Purchase Orders', doctype: 'Purchase Order', filters: { owner: frappe.session && frappe.session.user } } ], shortcuts: [] },
			"Administrator": { kpis: [ { label: 'Users', doctype: 'User', filters: {} }, { label: 'Companies', doctype: 'Company', filters: {} } ], shortcuts: [ { label: 'New User', doctype: 'User' }, { label: 'New Company', doctype: 'Company' } ] }
		};

		// Curated, role-specific dashboards for sidebar roles
		const curatedConfigByRole = {
			"Human Resource": {
				kpis: [
					{ label: 'Active Employees', doctype: 'Employee', filters: { status: 'Active' }, color: 'emerald' },
					{ label: 'Open Leave Applications', doctype: 'Leave Application', filters: { status: 'Open' }, color: 'indigo' },
					{ label: 'Attendance (Today)', doctype: 'Attendance', filters: { attendance_date: frappe.datetime.get_today() }, color: 'amber' }
				],
				recents: [ { doctype: 'Employee', fields: ['name','employee_name','status','modified'] } ]
			},
			"Expense Claims": {
				kpis: [
					{ label: 'Pending Expense Claims', doctype: 'Expense Claim', filters: { docstatus: 0 }, color: 'rose' },
					{ label: 'Approved (This Month)', doctype: 'Expense Claim', filters: { docstatus: 1 }, color: 'teal' },
					{ label: 'Rejected (This Month)', doctype: 'Expense Claim', filters: { docstatus: 2 }, color: 'danger' }
				],
				recents: [ { doctype: 'Expense Claim', fields: ['name','employee','total_claimed_amount','status','modified'] } ]
			},
			"Attendance": {
				kpis: [
					{ label: 'Present Today', doctype: 'Attendance', filters: { attendance_date: frappe.datetime.get_today(), status: 'Present' }, color: 'emerald' },
					{ label: 'Absent Today', doctype: 'Attendance', filters: { attendance_date: frappe.datetime.get_today(), status: 'Absent' }, color: 'rose' },
					{ label: 'On Leave Today', doctype: 'Attendance', filters: { attendance_date: frappe.datetime.get_today(), status: 'On Leave' }, color: 'indigo' }
				],
				recents: [ { doctype: 'Attendance', fields: ['name','employee','status','attendance_date','modified'] } ]
			},
			"Employee Lifecycle": {
				kpis: [
					{ label: 'New Hires (30d)', doctype: 'Employee', filters: {}, color: 'indigo' },
					{ label: 'Exits (30d)', doctype: 'Employee Separation', filters: {}, color: 'rose' },
					{ label: 'Open Appraisals', doctype: 'Appraisal', filters: { status: 'Draft' }, color: 'amber' }
				],
				recents: [ { doctype: 'Employee', fields: ['name','employee_name','status','date_of_joining','modified'] } ]
			},
			"Recruitment": {
				kpis: [
					{ label: 'New Applicants (30d)', doctype: 'Job Applicant', filters: {}, color: 'teal' },
					{ label: 'Open Job Openings', doctype: 'Job Opening', filters: { status: 'Open' }, color: 'indigo' },
					{ label: 'Offers Sent (30d)', doctype: 'Job Offer', filters: {}, color: 'emerald' }
				],
				recents: [ { doctype: 'Job Applicant', fields: ['name','applicant_name','status','modified'] } ]
			},
			"Payroll": {
				kpis: [
					{ label: 'Salary Slips (Draft)', doctype: 'Salary Slip', filters: { docstatus: 0 }, color: 'amber' },
					{ label: 'Payroll Entries (Open)', doctype: 'Payroll Entry', filters: { docstatus: 0 }, color: 'indigo' },
					{ label: 'Processed (This Month)', doctype: 'Salary Slip', filters: { docstatus: 1 }, color: 'emerald' }
				],
				recents: [ { doctype: 'Salary Slip', fields: ['name','employee','status','modified'] } ]
			},
			"Stock": {
				kpis: [
					{ label: 'Delivery Notes (Draft)', doctype: 'Delivery Note', filters: { docstatus: 0 }, color: 'indigo' },
					{ label: 'Stock Entries (Draft)', doctype: 'Stock Entry', filters: { docstatus: 0 }, color: 'teal' },
					{ label: 'Items', doctype: 'Item', filters: {}, color: 'amber' }
				],
				recents: [ { doctype: 'Stock Entry', fields: ['name','stock_entry_type','modified'] } ]
			},
			"Buying": {
				kpis: [
					{ label: 'Purchase Orders (Draft)', doctype: 'Purchase Order', filters: { docstatus: 0 }, color: 'indigo' },
					{ label: 'Receipts (Draft)', doctype: 'Purchase Receipt', filters: { docstatus: 0 }, color: 'teal' },
					{ label: 'Supplier Quotations (Draft)', doctype: 'Supplier Quotation', filters: { docstatus: 0 }, color: 'amber' }
				],
				recents: [ { doctype: 'Purchase Order', fields: ['name','supplier','transaction_date','modified'] } ]
			},
			"Selling": {
				kpis: [
					{ label: 'Quotations (Draft)', doctype: 'Quotation', filters: { docstatus: 0 }, color: 'indigo' },
					{ label: 'Sales Orders (Draft)', doctype: 'Sales Order', filters: { docstatus: 0 }, color: 'teal' },
					{ label: 'Delivery Notes (Draft)', doctype: 'Delivery Note', filters: { docstatus: 0 }, color: 'amber' }
				],
				recents: [ { doctype: 'Sales Order', fields: ['name','customer','transaction_date','modified'] } ]
			},
			"Project": {
				kpis: [
					{ label: 'Open Projects', doctype: 'Project', filters: { status: 'Open' }, color: 'indigo' },
					{ label: 'Open Tasks', doctype: 'Task', filters: { status: 'Open' }, color: 'amber' },
					{ label: 'Timesheets (30d)', doctype: 'Timesheet', filters: {}, color: 'teal' }
				],
				recents: [ { doctype: 'Task', fields: ['name','subject','status','modified'] } ]
			},
			"CRM": {
				kpis: [
					{ label: 'New Leads (30d)', doctype: 'Lead', filters: {}, color: 'teal' },
					{ label: 'Open Opportunities', doctype: 'Opportunity', filters: { status: ['!=','Lost'] }, color: 'indigo' },
					{ label: 'Open Issues', doctype: 'Issue', filters: { status: 'Open' }, color: 'amber' }
				],
				recents: [ { doctype: 'Opportunity', fields: ['name','opportunity_from','party_name','status','modified'] } ]
			},
			"Accounts": {
				kpis: [
					{ label: 'Unpaid Sales Invoices', doctype: 'Sales Invoice', filters: { outstanding_amount: ['>', 0] }, color: 'rose' },
					{ label: 'Unpaid Purchase Invoices', doctype: 'Purchase Invoice', filters: { outstanding_amount: ['>', 0] }, color: 'indigo' },
					{ label: 'Payment Entries (30d)', doctype: 'Payment Entry', filters: {}, color: 'emerald' }
				],
				recents: [ { doctype: 'Sales Invoice', fields: ['name','customer','outstanding_amount','modified'] } ]
			},
			"Asset": {
				kpis: [
					{ label: 'Active Assets', doctype: 'Asset', filters: { status: 'Active' }, color: 'indigo' },
					{ label: 'Assets on Maintenance', doctype: 'Asset', filters: { status: 'Maintenance' }, color: 'amber' },
					{ label: 'Asset Movements (30d)', doctype: 'Asset Movement', filters: {}, color: 'teal' }
				],
				recents: [ { doctype: 'Asset', fields: ['name','asset_name','status','modified'] } ]
			},
			"Manufacturing": {
				kpis: [
					{ label: 'Open Work Orders', doctype: 'Work Order', filters: { status: 'Not Started' }, color: 'indigo' },
					{ label: 'In Process Job Cards', doctype: 'Job Card', filters: { status: 'Work In Progress' }, color: 'amber' },
					{ label: 'BOMs', doctype: 'BOM', filters: {}, color: 'teal' }
				],
				recents: [ { doctype: 'Work Order', fields: ['name','status','production_item','modified'] } ]
			}
		};

		async function getCount(doctype, filters) {
			try {
				const r = await frappe.call({ method: 'frappe.client.get_count', args: { doctype, filters } });
				return r && typeof r.message === 'number' ? r.message : 0;
			} catch (e) { return 0; }
		}

		function bootSets(){
			const u = window.frappe?.boot?.user || {};
			return {
				can_read: new Set(u.can_read || []),
				can_create: new Set(u.can_create || [])
			};
		}

		function kpiCandidate(label, doctype, filters){ return { label, doctype, filters: filters || {} }; }

		function buildDynamicConfigForRole(role){
			const perms = bootSets();
			const candidates = [
				kpiCandidate('Quotations (Draft)','Quotation',{ docstatus: 0 }),
				kpiCandidate('Sales Orders (Draft)','Sales Order',{ docstatus: 0 }),
				kpiCandidate('Sales Invoices (Draft)','Sales Invoice',{ docstatus: 0 }),
				kpiCandidate('Purchase Orders (Draft)','Purchase Order',{ docstatus: 0 }),
				kpiCandidate('Purchase Invoices (Draft)','Purchase Invoice',{ docstatus: 0 }),
				kpiCandidate('Supplier Quotations (Draft)','Supplier Quotation',{ docstatus: 0 }),
				kpiCandidate('Delivery Notes (Draft)','Delivery Note',{ docstatus: 0 }),
				kpiCandidate('Stock Entries (Draft)','Stock Entry',{ docstatus: 0 }),
				kpiCandidate('Open Projects','Project',{ status: 'Open' }),
				kpiCandidate('Open Tasks','Task',{ status: 'Open' }),
				kpiCandidate('Open Issues','Issue',{ status: 'Open' }),
				kpiCandidate('Open Leaves','Leave Application',{ status: 'Open' }),
				kpiCandidate('Payment Entries','Payment Entry',{}),
				kpiCandidate('Journal Entries','Journal Entry',{})
			];
			const kpis = candidates.filter(c => perms.can_read.has(c.doctype)).slice(0, 6);
			const shortcutCandidates = ['Quotation','Sales Order','Sales Invoice','Purchase Order','Purchase Invoice','Delivery Note','Stock Entry','Task','Issue','Payment Entry','Journal Entry','Project'];
			const shortcuts = shortcutCandidates.filter(d => perms.can_create.has(d) || perms.can_read.has(d)).slice(0, 4).map(d => ({ label: 'New ' + d, doctype: d }));
			if (!kpis.length) {
				// Ultimate fallback
				kpis.push(kpiCandidate('My ToDos','ToDo',{ status: ['!=','Closed'], owner: frappe.session && frappe.session.user }));
			}
			return { kpis, shortcuts };
		}

		function renderShortcuts(container, shortcuts) {
			const row = document.createElement('div'); row.className = 'nt-dash-actions';
			(shortcuts || []).forEach(s => {
				const b = document.createElement('button'); b.className = 'nt-btn'; b.textContent = s.label;
				b.onclick = () => { try { frappe.new_doc(s.doctype); } catch (e) {} };
				row.appendChild(b);
			});
			container.appendChild(row);
		}

		async function renderKPIs(container, kpis) {
			const grid = document.createElement('div'); grid.className = 'nt-dash-grid';
			for (const k of (kpis || [])) {
				const val = await getCount(k.doctype, k.filters || {});
				const card = document.createElement('div'); card.className = 'nt-card nt-kpi' + (k.color ? (' nt-kpi-' + k.color) : '');
				card.innerHTML = `<div class="nt-kpi-value">${val}</div><div class="nt-kpi-label">${k.label}</div>`;
				card.style.cursor = 'pointer';
				card.title = 'View details';
				card.onclick = () => {
					try{
						const from = document.getElementById('nt-d-from')?.value;
						const to = document.getElementById('nt-d-to')?.value;
						const routeFilters = Object.assign({}, k.filters || {});
						if (from && to) routeFilters.creation = ['between', [from, to]];
						frappe.route_options = routeFilters;
						frappe.set_route('List', k.doctype);
					} catch(e) {}
				};
				grid.appendChild(card);
			}
			container.appendChild(grid);
		}

		function renderHero(container, role){
			const user = (window.frappe?.boot?.user || {});
			const name = user.full_name || user.name || 'User';
			const hero = document.createElement('div'); hero.className = 'nt-hero';
			hero.innerHTML = `<div class="nt-hero-left"><div class="nt-hero-title">Welcome, ${name}</div><div class="nt-hero-sub">${role} overview</div></div><div class="nt-hero-right"></div>`;
			container.appendChild(hero);
		}

		function numberFormat(n){ try{ return (n||0).toLocaleString(); }catch(e){ return String(n||0); } }

		async function renderTopList(container, opts){
			const card = document.createElement('div'); card.className = 'nt-card nt-top-card';
			card.innerHTML = `<div class="nt-card-header">${opts.title || 'Top List'}</div><div class="nt-top-body"></div>`;
			container.appendChild(card);
			const body = card.querySelector('.nt-top-body');
			try{
				const args = { doctype: opts.doctype, fields: opts.fields, order_by: opts.orderBy || '', limit: opts.limit || 10 };
				const filters = [];
				if (opts.from && opts.to && opts.dateField) filters.push([opts.dateField,'between',[opts.from, opts.to]]);
				else if (opts.since && opts.dateField) filters.push([opts.dateField, '>=', opts.since]);
				(opts.filters_extra || []).forEach(f => filters.push(f));
				if (filters.length) args.filters = filters;
				if (opts.groupBy) args.group_by = opts.groupBy;
				const r = await frappe.call({ method:'frappe.client.get_list', args });
				const rows = r.message || [];
				if(!rows.length){ body.innerHTML = '<div class="nt-muted">No data</div>'; return; }
				const labelKey = opts.labelField || opts.groupBy || Object.keys(rows[0])[0];
				const valueKey = opts.valueField || 'amount';
				body.innerHTML = rows.map((row, i) => `<div class="nt-top-row"><div class="nt-top-left"><span class="nt-rank">${i+1}</span> <span class="nt-name">${row[labelKey]||'-'}</span></div><div class="nt-top-right">${numberFormat(row[valueKey] || row.qty || row.amount || 0)}</div></div>`).join('');
			}catch(e){ body.innerHTML = '<div class="nt-muted">Failed to load</div>'; }
		}

		async function buildAggList(doctype, labelField, valueExpr, dateField, from, to, since, extraFilters){
			const args = { doctype, fields: [labelField, `${valueExpr} as value`], group_by: labelField, order_by: 'value desc', limit: 10 };
			const filters = [];
			if (from && to && dateField) filters.push([dateField,'between',[from, to]]);
			else if (since && dateField) filters.push([dateField, '>=', since]);
			(extraFilters || []).forEach(f => filters.push(f));
			if (filters.length) args.filters = filters;
			const r = await frappe.call({ method:'frappe.client.get_list', args });
			return (r.message || []).map(x => ({ label: x[labelField], value: x.value }));
		}

		async function buildPieChart(el, doctype, labelField, valueExpr, dateField, from, to, since, extraFilters){
			try{
				const rows = await buildAggList(doctype, labelField, valueExpr, dateField, from, to, since, extraFilters);
				if (!rows.length) { el.textContent = 'No data'; return; }
				const labels = rows.map(r => String(r.label || '-'));
				const values = rows.map(r => Number(r.value || 0));
				if(chartAvailable()){
					new frappe.Chart(el, { data: { labels, datasets: [{ values }] }, type:'percentage', height: 220, colors: ['#0EA5E9','#22C55E','#F59E0B','#6366F1','#EF4444','#14B8A6','#A78BFA','#84CC16','#F97316','#10B981'] });
				}else{
					el.textContent = values.join(', ');
				}
			}catch(e){ el.textContent=''; }
		}

		async function buildTrendChartLarge(el, doctype, dateField, from, to, since, chartType){
			try{
				const args = { doctype, fields:['name', dateField], limit: 1000, order_by: `${dateField} asc` };
				const filters = [];
				if (from && to && dateField) filters.push([dateField,'between',[from, to]]);
				else if (since && dateField) filters.push([dateField, '>=', since]);
				if (filters.length) args.filters = filters;
				const r = await frappe.call({ method:'frappe.client.get_list', args });
				const rows = (r.message||[]).map(x=>String(x[dateField]).substr(0,10));
				const m = {};
				rows.forEach(d => { m[d] = (m[d]||0)+1; });
				const labels = Object.keys(m);
				const values = labels.map(d=>m[d]);
				if(chartAvailable()){
					new frappe.Chart(el, { type: chartType || 'line', height: 260, data: { labels, datasets: [{ name: doctype, values }] } });
				}else{ el.textContent = values.join(', '); }
			}catch(e){ el.textContent=''; }
		}

		async function renderRecents(container, listDefs){
			if(!listDefs || !listDefs.length) return;
			const holder = document.createElement('div'); holder.className = 'nt-card';
			holder.innerHTML = `<div class="nt-card-header">Recent Items</div><div class="nt-table"><div class="nt-thead"></div><div class="nt-tbody"></div></div>`;
			container.appendChild(holder);
			const head = holder.querySelector('.nt-thead');
			const body = holder.querySelector('.nt-tbody');
			const def = listDefs[0];
			try{
				const r = await frappe.call({ method:'frappe.client.get_list', args:{ doctype:def.doctype, fields:def.fields, order_by: 'modified desc', limit: 8 } });
				const rows = r.message || [];
				if(!rows.length) { holder.style.display='none'; return; }
				const cols = Object.keys(rows[0]||{});
				head.innerHTML = `<div class="nt-tr">${cols.map(c=>`<div class=\"nt-th\">${c}</div>`).join('')}</div>`;
				body.innerHTML = rows.map(row => `<div class="nt-tr">${cols.map(c=>`<div class=\"nt-td\" title=\"${String(row[c]||'')}\">${String(row[c]||'')}</div>`).join('')}</div>`).join('');
			}catch(e){}
		}

		function chartAvailable(){ return window.frappe && window.frappe.Chart; }
        async function buildMiniChart(el, doctype, days, chartType){
			try{
				const since = frappe.datetime.add_days(frappe.datetime.get_today(), -days);
				const r = await frappe.call({ method: 'frappe.client.get_list', args: { doctype, fields:['name','creation'], filters:[['creation','>=', since]], limit: 500, order_by: 'creation asc' } });
				const rows = (r.message||[]).map(x=>x.creation.substr(0,10));
				const series = {};
				rows.forEach(d=>{ series[d]=(series[d]||0)+1; });
				const labels = Object.keys(series);
				const values = labels.map(d=>series[d]);
				if(chartAvailable()){
                    new frappe.Chart(el, { data: { labels, datasets: [{ name: doctype, values }] }, type:(chartType||'bar'), height:120 });
				}else{
					el.textContent = values.join(', ');
				}
			}catch(e){ el.textContent=''; }
		}

		function showToast(msg){ try{ frappe.show_alert({ message: msg, indicator: 'blue'});}catch(e){} }
		function exportCSV(rows, name){
			const csv = [Object.keys(rows[0]||{}).join(',')].concat((rows||[]).map(r=>Object.values(r).map(x=>`"${String(x).replaceAll('"','""')}"`).join(','))).join('\n');
			const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
			const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(name||'export')+'.csv'; a.click();
		}

		async function showDashboard(role){
			const host = document.getElementById('nt-content') || document.querySelector('.page-container');
			if (!host) return;
			host.innerHTML = '';
			const wrap = document.createElement('div'); wrap.className = 'nt-dashboard nt-dash-compact';
			wrap.innerHTML = `<div class=\"nt-dash-head\"><h2>${role} Dashboard</h2><div class=\"nt-dash-tools\"><input id=\"nt-d-from\" type=\"date\" class=\"nt-input\"/><input id=\"nt-d-to\" type=\"date\" class=\"nt-input\"/><select id=\"nt-d-range\"><option value=\"7\">7d</option><option value=\"30\">30d</option><option value=\"90\">90d</option></select><select id=\"nt-d-ctype\"><option value=\"bar\">Bar</option><option value=\"line\">Line</option></select><label style=\"display:inline-flex;align-items:center;gap:4px;\"><input id=\"nt-d-auto\" type=\"checkbox\"/> Auto</label><button id=\"nt-d-refresh\" class=\"nt-btn\">Refresh</button></div></div>`;
			host.appendChild(wrap);
			const cfg = curatedConfigByRole[role] || roleDashConfig[role] || buildDynamicConfigForRole(role);
			renderHero(wrap, role);
			renderShortcuts(wrap, cfg.shortcuts);
			renderKPIs(wrap, cfg.kpis);
			// charts row
			const chartGrid = document.createElement('div'); chartGrid.className = 'nt-dash-grid';
			(wrap.appendChild(chartGrid));
			const chartTypeSel = wrap.querySelector('#nt-d-ctype');
			const rangeSel = wrap.querySelector('#nt-d-range');
			// apply preset early so charts use selected values
			try {
				const presetEarly = JSON.parse(localStorage.getItem('nt:dash:'+role)||'null');
				if (presetEarly) {
					if (presetEarly.range && rangeSel) rangeSel.value = String(presetEarly.range);
					if (presetEarly.ctype && chartTypeSel) chartTypeSel.value = String(presetEarly.ctype);
					if (presetEarly.compact === false) wrap.classList.remove('nt-dash-compact');
				}
			} catch(e) {}
			(cfg.kpis || []).slice(0,3).forEach(k => {
				const c = document.createElement('div'); c.className = 'nt-card';
				const days = Number((rangeSel && rangeSel.value) || 30);
				const type = (chartTypeSel && chartTypeSel.value) || 'bar';
				c.innerHTML = `<div style=\"font-size:12px;color:var(--nt-text-dim);margin-bottom:6px\">${k.label} (last ${days}d)</div><div class=\"nt-mini-chart nt-skeleton\"></div>`;
				chartGrid.appendChild(c);
				buildMiniChart(c.querySelector('.nt-mini-chart'), k.doctype, days, type);
			});
			await renderRecents(wrap, cfg.recents || []);

			// Top Lists (role/perms aware) — ONLY add widgets relevant to the selected role
			const perms = bootSets();
			const topGrid = document.createElement('div'); topGrid.className = 'nt-dash-grid nt-top-grid';
			wrap.appendChild(topGrid);
			const from = wrap.querySelector('#nt-d-from')?.value || null;
			const to = wrap.querySelector('#nt-d-to')?.value || null;
			const rangeSel2 = wrap.querySelector('#nt-d-range');
			const since = (!from || !to) ? frappe.datetime.add_days(frappe.datetime.get_today(), -Number((rangeSel2 && rangeSel2.value) || 30)) : null;
			if (/Selling|Sales|CRM|Accounts|Human Resource/i.test(role)) {
				if (perms.can_read.has('Sales Invoice')) {
					await renderTopList(topGrid, { title:'Top Customers (Sales)', doctype:'Sales Invoice', fields:['customer','sum(grand_total) as amount'], groupBy:'customer', orderBy:'amount desc', dateField:'posting_date', from, to, since, valueField:'amount', labelField:'customer' });
					await renderTopList(topGrid, { title:'Top Customers (Invoice Count)', doctype:'Sales Invoice', fields:['customer','count(name) as count'], groupBy:'customer', orderBy:'count desc', dateField:'posting_date', from, to, since, valueField:'count', labelField:'customer' });
					await renderTopList(topGrid, { title:'Top Returns (Customers)', doctype:'Sales Invoice', fields:['customer','sum(grand_total) as amount'], groupBy:'customer', orderBy:'amount desc', dateField:'posting_date', from, to, since, valueField:'amount', labelField:'customer', filters_extra:[['is_return','=',1]] });
					await renderTopList(topGrid, { title:'Top Customers (Receivables)', doctype:'Sales Invoice', fields:['customer','sum(outstanding_amount) as amount'], groupBy:'customer', orderBy:'amount desc', dateField:'posting_date', from, to, since, valueField:'amount', labelField:'customer', filters_extra:[['docstatus','=',1], ['outstanding_amount','>',0]] });
				}
				if (perms.can_read.has('Sales Invoice Item')) {
					await renderTopList(topGrid, { title:'Top Items (Sold Qty)', doctype:'Sales Invoice Item', fields:['item_code','sum(qty) as qty'], groupBy:'item_code', orderBy:'qty desc', dateField:'creation', from, to, since, valueField:'qty', labelField:'item_code' });
					await renderTopList(topGrid, { title:'Top Items (Revenue)', doctype:'Sales Invoice Item', fields:['item_code','sum(amount) as amount'], groupBy:'item_code', orderBy:'amount desc', dateField:'creation', from, to, since, valueField:'amount', labelField:'item_code' });
					const since90 = frappe.datetime.add_days(frappe.datetime.get_today(), -90);
					await renderTopList(topGrid, { title:'Slow-moving Items (90d)', doctype:'Sales Invoice Item', fields:['item_code','sum(qty) as qty'], groupBy:'item_code', orderBy:'qty asc', dateField:'creation', since: since90, valueField:'qty', labelField:'item_code' });
				}
			}
			if (/Buying|Stock|Purchase|Asset|Manufacturing/i.test(role)) {
				if (perms.can_read.has('Purchase Invoice')) {
					await renderTopList(topGrid, { title:'Top Suppliers (Purchase)', doctype:'Purchase Invoice', fields:['supplier','sum(grand_total) as amount'], groupBy:'supplier', orderBy:'amount desc', dateField:'posting_date', from, to, since, valueField:'amount', labelField:'supplier' });
					await renderTopList(topGrid, { title:'Top Suppliers (Invoice Count)', doctype:'Purchase Invoice', fields:['supplier','count(name) as count'], groupBy:'supplier', orderBy:'count desc', dateField:'posting_date', from, to, since, valueField:'count', labelField:'supplier' });
					await renderTopList(topGrid, { title:'Top Suppliers (Payables)', doctype:'Purchase Invoice', fields:['supplier','sum(outstanding_amount) as amount'], groupBy:'supplier', orderBy:'amount desc', dateField:'posting_date', from, to, since, valueField:'amount', labelField:'supplier', filters_extra:[['docstatus','=',1], ['outstanding_amount','>',0]] });
				}
			}
            // load preset if available
            try{
                const preset = JSON.parse(localStorage.getItem('nt:dash:'+role)||'null');
                if(preset){
                    if(preset.range) wrap.querySelector('#nt-d-range').value = String(preset.range);
                    if(preset.ctype) chartTypeSel.value = preset.ctype;
                    if(preset.compact === false) wrap.classList.remove('nt-dash-compact');
                }
            }catch(e){}
			const btn = wrap.querySelector('#nt-d-refresh');
			if(btn){ btn.onclick = () => showDashboard(role); }
			const full = wrap.querySelector('#nt-d-full'); if(full){ full.onclick = () => { document.body.classList.toggle('nt-dash-fullscreen'); }; }
			const compact = wrap.querySelector('#nt-d-compact'); if(compact){ compact.onclick = () => { wrap.classList.toggle('nt-dash-compact'); }; }
            const exp = wrap.querySelector('#nt-d-export'); if(exp){ exp.onclick = async () => {
				try{
					const sample = await frappe.call({ method:'frappe.client.get_list', args:{ doctype:(cfg.kpis[0]&&cfg.kpis[0].doctype)||'ToDo', fields:['name','owner','creation'], limit:50 } });
					exportCSV(sample.message||[], role.replace(/\s+/g,'_')+'_kpis');
					showToast('CSV exported');
				}catch(e){ showToast('Export failed'); }
			}; }
            const save = wrap.querySelector('#nt-d-save'); if(save){ save.onclick = () => {
                const data = { range: Number(wrap.querySelector('#nt-d-range').value||30), ctype: String(wrap.querySelector('#nt-d-ctype').value||'bar'), compact: wrap.classList.contains('nt-dash-compact') };
                try{ localStorage.setItem('nt:dash:'+role, JSON.stringify(data||{})); showToast('Preset saved'); }catch(e){}
            }; }
			const def = wrap.querySelector('#nt-d-def'); if(def){ def.onclick = () => { try{ localStorage.setItem('nt:defaultDash', role); showToast('Default dashboard set'); }catch(e){} }; }
			// react to control changes
			if (chartTypeSel) chartTypeSel.onchange = () => showDashboard(role);
			if (rangeSel) rangeSel.onchange = () => showDashboard(role);
            // auto refresh
            const auto = wrap.querySelector('#nt-d-auto');
            if(auto){
                let timer = null;
                auto.onchange = () => {
                    if(auto.checked){ timer = setInterval(()=>showDashboard(role), 30000); }
                    else if(timer){ clearInterval(timer); timer=null; }
                };
            }
		}
		// expose for sidebar click
		window.ntDashShow = showDashboard;

		// Redirects
		try {
			const p = location.pathname.replace(/\/$/, '');
    // 0) If at site root '/', go to /app
    if (p === '' || p === '/') {
      location.replace('/app');
    }
    // 1) If at /app, forward to /app/home (user preference)
			if (p === '/app') {
				location.replace('/app/home');
			}
			// 2) If at /app/home, render default dashboard WITHOUT changing hash
			if (p === '/app/home') {
				const defaultDash = 'Human Resource';
				setTimeout(() => { closeNotFoundDialog(); window.ntDashShow && window.ntDashShow(defaultDash); }, 0);
			}
			// 3) legacy server routes like /dash/<Role> or /app/dash/<Role> -> client hash router
			let m = p.match(/^\/dash\/(.+)$/) || p.match(/^\/app\/dash\/(.+)$/);
			if (m && m[1]) {
				const role = decodeURIComponent(m[1]);
				location.replace('/app#dash/' + encodeURIComponent(role));
				setTimeout(() => { closeNotFoundDialog(); window.ntDashShow && window.ntDashShow(role); }, 0);
			}
		} catch (e) {}
	});
})();

