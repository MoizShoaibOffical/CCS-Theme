/* global frappe */
/* eslint-env browser */
/*
	Custom Desk layout: replaces default navbar/sidebar with New Theme layout
*/
(function () {
	// Early redirect to preferred dashboard to avoid loading default HR widgets
	try {
		const prefDash = getPreferredLabel();
		if (prefDash) {
			const path = location.pathname.toLowerCase();
			const hash = (location.hash || '').toLowerCase();
			const isHome = hash.includes('app/home') || path.endsWith('/app/home') || path.endsWith('/app') || hash === '';
			if (isHome) {
				// Always land on assigned dashboard as Home
				const target = `dashboard-view/${encodeURIComponent(prefDash)}`;
				if (target) location.hash = '#' + target;
			}
		}
	} catch (e) {}
	function createContainer() {
		let root = document.getElementById("nt-root");
		if (root) return root;
		root = document.createElement("div");
		root.id = "nt-root";
		const layout = (window.frappe?.boot?.new_theme_settings?.desk_layout || "Left Sidebar").toLowerCase();
		root.setAttribute("data-layout", layout);
		const settings = window.frappe?.boot?.new_theme_settings || {};
		const brandText = settings.brand_name || "NewDesk";
		// Fallback to app asset if settings.logo not provided
		const brandLogo = settings.brand_logo || "/assets/new_theme/logo.svg";
		root.innerHTML = `
			<div class="nt-topbar">
				<div class="nt-brand">
					${brandLogo ? `<img id="nt-logo" class="nt-brand-logo" src="${brandLogo}" alt="logo" />` : ""}
					<span class="nt-brand-text">${brandText}</span>
				</div>
				<div class="nt-breadcrumbs" id="nt-breadcrumbs"></div>
				<div class="nt-search">
					<input class="nt-input" id="nt-cmdk" placeholder="Search (Ctrl/Cmd+K)…"/>
				</div>
                <div id="nt-spacer"></div>
				<div class="nt-actions">
					
					<div class="nt-dropdown" id="nt-addnew" style="font-size: 12px;">
						<div class="nt-btn" id="nt-addnew-btn" title="Add New">⊕ Add New</div>
						<div class="nt-menu nt-mega" id="nt-addnew-menu">
							<div class="nt-grid" id="nt-addnew-grid"></div>
						</div>
					</div>
					
					<!-- Density menu removed; default density enforced -->
					<div class="nt-dropdown" id="nt-width">
						
					</div>
					
					
					<div class="nt-btn" id="nt-star" title="Pin Current">☆</div>
					<div class="nt-btn" id="nt-fullscreen" title="Full Screen" data-state="enter"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" focusable="false"><path class="nt-fs-enter" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 8V5a2 2 0 0 1 2-2h3m8 0h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/><path class="nt-fs-exit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 0 1 2 2v4M9 3H5a2 2 0 0 0-2 2v4m0 6v4a2 2 0 0 0 2 2h4m6 0h4a2 2 0 0 0 2-2v-4"/></svg></div>
					<!-- Theme toggle removed -->
					
                    <div class="nt-dropdown" id="nt-notify" style="display:block" aria-label="Notifications">
						<div class="nt-btn" id="nt-bell" title="Notifications"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" focusable="false"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"/></svg><span id="nt-badge" class="nt-badge" style="display:none"></span></div>
						<div class="nt-menu nt-menu-lg" id="nt-bell-menu"></div>
					</div>
					<div id="nt-user"></div>
				</div>
			</div>

			<div class="nt-main">
				<aside class="nt-sidebar"><nav id="nt-nav"></nav></aside>
				<section class="nt-content" id="nt-content"></section>
			</div>`;
		document.body.appendChild(root);
		return root;
	}

	function hideDefaultUI() {
		// Hide default desk elements; keep form page-head visible (contains Save/Submit)
		document.querySelectorAll(".standard-sidebar").forEach((el) => (el.style.display = "none"));
		document.querySelectorAll(".navbar").forEach((el) => (el.style.display = "none"));
		const pageContainer = document.querySelector(".page-container");
		if (pageContainer) pageContainer.style.paddingTop = "0px";
	}

function navItem(label, routeOrSlug) {
		const a = document.createElement("a");
		a.className = "nt-nav-item";
		a.textContent = label;
	// Avoid browser turning '#' into '%23' in path; we route via JS
	a.href = "javascript:void(0)";
	const short = (label || String(routeOrSlug) || "").trim().slice(0, 2).toUpperCase();
		a.setAttribute("data-short", short);
		a.onclick = (e) => {
			e.preventDefault();
		if (typeof routeOrSlug === 'function') {
			return routeOrSlug();
		}
		if (window.frappe?.router) {
			window.frappe.router.set_route(routeOrSlug);
		}
		};
		return a;
	}

// Feature flags
const HIDE_WORKSPACES = false; // Show Workspace section; Home still routes to assigned dashboard

// Preferred dashboard helpers (keyed per user)
function getPreferredKey() {
    const u = (window.frappe?.session?.user || 'guest');
    return `nt:preferred-dashboard:${u}`;
}
function getPreferredLabel() {
    try {
        const v = (localStorage.getItem(getPreferredKey()) || '').trim();
        if (v) return v;
        const bootPref = (window.frappe?.boot?.new_theme_settings?.default_dashboard || '').trim();
        return bootPref;
    } catch (e) { return ''; }
}

// Resolve a list of dashboards to show based on roles or a per-user preference
function resolveDashboardsForUser(allLabels) {
	try {
		// 1) Per-user override via localStorage or boot (if provided by backend)
		const ls = getPreferredLabel();
		const bootPref = (window.frappe?.boot?.new_theme_settings?.default_dashboard || '').trim();
		const pick = ls || bootPref;
		if (pick && allLabels.includes(pick)) return [pick];
		// 2) Role-based filter using a simple label-to-roles map
		const roles = new Set(window.frappe?.boot?.user?.roles || []);
		const map = {
			'Human Resource': ['HR User', 'HR Manager'],
			'Expense Claims': ['HR User', 'HR Manager', 'Employee'],
			'Attendance': ['HR User', 'HR Manager', 'Employee'],
			'Employee Lifecycle': ['HR User', 'HR Manager'],
			'Recruitment': ['HR User', 'HR Manager'],
			'Payroll': ['HR User', 'HR Manager', 'Payroll User', 'Payroll Manager'],
			'Stock': ['Stock User', 'Stock Manager'],
			'Buying': ['Purchase User', 'Purchase Manager'],
			'Selling': ['Sales User', 'Sales Manager'],
			'Project': ['Projects User', 'Projects Manager'],
			'CRM': ['Sales User', 'Sales Manager', 'CRM User'],
			'Accounts': ['Accounts User', 'Accounts Manager'],
			'Asset': ['Assets Manager', 'Accounts User', 'Accounts Manager'],
			'Manufacturing': ['Manufacturing User', 'Manufacturing Manager']
		};
		const filtered = allLabels.filter(lbl => {
			const allow = map[lbl];
			if (!allow || !allow.length) return true; // if unmapped, don't hide
			return allow.some(r => roles.has(r));
		});
		return filtered.length ? filtered : allLabels;
	} catch (e) {
		return allLabels;
	}
}

// Optionally fetch user's preferred dashboard custom field and persist to localStorage, then rebuild nav
async function loadUserDashboardPreference() {
	try {
		const user = window.frappe?.session?.user;
		if (!user || !window.frappe?.call) return;
		// 1) Try User custom field (nt_preferred_dashboard)
		const r = await frappe.call({
			method: 'frappe.client.get_value',
			args: { doctype: 'User', fieldname: 'nt_preferred_dashboard', filters: { name: user } },
		});
		const msg = r && r.message;
		let val = (msg?.nt_preferred_dashboard || '').trim();
		// 2) Fallback to Dashboard Assign DocType (named by user)
		if (!val) {
			try {
				const r2 = await frappe.call({
					method: 'frappe.client.get_value',
					args: { doctype: 'Dashboard Assign', fieldname: 'dashboard', filters: { name: user } },
				});
				val = (r2 && r2.message && r2.message.dashboard) ? String(r2.message.dashboard).trim() : '';
			} catch (e) {}
		}
		if (val) {
			const curr = getPreferredLabel();
			if (curr !== val) {
				localStorage.setItem(getPreferredKey(), val);
				try { window.rebuildSidebar && window.rebuildSidebar(); } catch (e) {}
				try { document.dispatchEvent(new Event('nt:preferred-dashboard-updated')); } catch (e) {}
			}
		}
	} catch (e) {
		// field may not exist; ignore
	}
}

// Map dashboard names to actual Dashboard document names
function getDashboardDocumentName(dashboardName) {
	// These are the actual dashboard names from your DryFruit site
	const dashboardMap = {
		'Stock': 'Stock',
		'Human Resource': 'Human Resource', 
		'Accounts': 'Accounts',
		'CRM': 'CRM',
		'Project': 'Project',
		'Manufacturing': 'Manufacturing',
		'Buying': 'Buying',
		'Selling': 'Selling',
		'Asset': 'Asset',
		'Expense Claims': 'Expense Claims',
		'Attendance': 'Attendance',
		'Employee Lifecycle': 'Employee Lifecycle',
		'Recruitment': 'Recruitment',
		'Payroll': 'Payroll'
	};
	return dashboardMap[dashboardName] || dashboardName;
}

function maybeRedirectToPreferredDashboard() {
	try {
		const pref = getPreferredLabel();
		if (!pref) return;
		const routeArr = (window.frappe?.router?.current_route || []);
		const routeStr = routeArr.join('/').toLowerCase();
		const homeRegex = new RegExp('(^|\\/)home(\\b|\\/)');
		const onHome = routeStr === '' || routeStr === 'home' || routeStr === 'app/home' || homeRegex.test(routeStr);
		const onAppRoot = /\/app\/?$/.test(location.pathname);
		if (onHome || onAppRoot) {
			// Map the preferred dashboard name to actual Dashboard document name
			const dashboardDocName = getDashboardDocumentName(pref);
			console.log('Redirecting to dashboard:', pref, '->', dashboardDocName);
			try { 
				window.frappe?.router?.set_route('dashboard-view', dashboardDocName);
				// Force a page reload to ensure correct dashboard content
				setTimeout(() => {
					if (window.frappe?.router?.current_route?.[0] === 'dashboard-view' && 
						window.frappe?.router?.current_route?.[1] === dashboardDocName) {
						// Check if we're actually showing the right content
						const pageTitle = document.querySelector('.page-title, .page-head .page-title, h1');
						if (pageTitle && !pageTitle.textContent.toLowerCase().includes(pref.toLowerCase())) {
							console.log('Forcing dashboard reload for:', dashboardDocName);
							window.location.reload();
						}
					}
				}, 500);
			}
			catch (e) { 
				console.warn('Failed to redirect to dashboard:', e);
				try { location.hash = '#dashboard-view/' + encodeURIComponent(dashboardDocName); } catch (e2) {} 
			}
		}
	} catch (e) {}
}

function resolvePreferredHomeRoute(pref) {
	try {
		const p = (pref || '').toString().trim();
		if (!p) return '';
		const workspaces = (window.frappe?.boot?.allowed_workspaces || []);
		const slug = (s) => {
			try { return (window.frappe?.router?.slug ? frappe.router.slug(s) : String(s)).toLowerCase(); } catch (e) { return String(s || '').toLowerCase(); }
		};
		const pSlug = slug(p);
		// Best match priority: exact title/name -> slug match -> substring in title
		let ws = workspaces.find(w => (w.title || w.name || '').toString().toLowerCase() === p.toLowerCase());
		if (!ws) ws = workspaces.find(w => slug(w.title || w.name) === pSlug || slug(w.name) === pSlug);
		if (!ws) ws = workspaces.find(w => ((w.title || '').toString().toLowerCase().includes(p.toLowerCase())));
		if (ws && ws.name) return `workspace/${encodeURIComponent(ws.name)}`;
		// Fallback to ERPNext dashboard view
		return `dashboard-view/${encodeURIComponent(p)}`;
	} catch (e) { return ''; }
}

	function buildNav() {
		const nav = document.getElementById("nt-nav");
		if (!nav) return;
		nav.innerHTML = "";

		// Sidebar tools (search + expand/collapse)
	addSidebarTools(nav);

		// Control whether to show generic modules/doctype list (set to false to rely on Workspaces)
		const SHOW_GENERIC_MODULES = false;
		

	// Dashboards parent with curated submenu (collapsible)
	try {
		const allDashboards = [
			"Human Resource","Expense Claims","Attendance","Employee Lifecycle","Recruitment","Payroll",
			"Stock","Buying","Selling","Project","CRM","Accounts","Asset","Manufacturing"
		];
		const dashboards = resolveDashboardsForUser(allDashboards);
		if (dashboards.length) {
			const section = document.createElement('div');
			section.className = 'nt-nav-section';
			const group = document.createElement('div'); group.className = 'nt-nav-sub-group';
			const head = document.createElement('a'); head.className = 'nt-nav-item nt-nav-sub-head'; head.href = 'javascript:void(0)'; head.innerHTML = `Dashboards <span class="nt-chevron">▶</span>`;
			const sub = document.createElement('div'); sub.className = 'nt-sublist-2';
			const dashKey = 'nt:dashboards-open';
			// If a single preferred dashboard is set, open the group by default
		const preferred = getPreferredLabel();
			if (preferred && dashboards.length === 1) { group.classList.add('open'); sub.style.display = 'block'; const chev0 = head.querySelector('.nt-chevron'); if (chev0) chev0.style.transform = 'rotate(90deg)'; }
			if (localStorage.getItem(dashKey) === '1') { group.classList.add('open'); sub.style.display = 'block'; const chev0 = head.querySelector('.nt-chevron'); if (chev0) chev0.style.transform = 'rotate(90deg)'; }
			head.onclick = (e) => {
				e.preventDefault();
				group.classList.toggle('open');
				sub.style.display = group.classList.contains('open') ? 'block' : 'none';
				localStorage.setItem(dashKey, group.classList.contains('open') ? '1' : '0');
				const chev = head.querySelector('.nt-chevron'); if (chev) chev.style.transform = group.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0)';
			};
			dashboards.forEach(role => {
				const item = document.createElement('a');
				item.className = 'nt-nav-item';
				item.textContent = role;
				item.href = 'javascript:void(0)';
				item.onclick = () => { 
			try { 
				// Map dashboard name to actual Dashboard document name
				const dashboardDocName = getDashboardDocumentName(role);
				console.log('Navigating to dashboard:', role, '->', dashboardDocName);
				// Navigate to dashboard view with the selected dashboard
				if (window.frappe?.router) {
					window.frappe.router.set_route('dashboard-view', dashboardDocName);
				}
			} catch (e) {
				console.warn('Failed to navigate to dashboard:', role, e);
			}
		};
				sub.appendChild(item);
			});
			group.appendChild(head);
			group.appendChild(sub);
			section.appendChild(group);
			nav.appendChild(section);
		}
	} catch (e) { console.warn('Dashboard menu build failed', e); }
	
	// Add test function to window for debugging
	window.testCardBreakMenu = function() {
		console.log('Testing Card Break Menu structure...');
		const workspaceConfig = window.frappe?.boot?.workspace_sidebar_config || [];
		console.log('Workspace Config:', workspaceConfig);
		
		workspaceConfig.forEach(workspace => {
			console.log(`Workspace: ${workspace.label}`);
			console.log('  - Workspace Links:', workspace.workspace_links);
			console.log('  - Sub Menus:', workspace.sub_menus);
			
			if (workspace.sub_menus) {
				workspace.sub_menus.forEach(cardMenu => {
					console.log(`    Card Break Menu: ${cardMenu.label}`);
					console.log('      - Children:', cardMenu.children);
				});
			}
		});
	};
	
	// Add function to manually create test Card Break Menu
	window.createTestCardBreakMenu = function() {
		console.log('Creating test Card Break Menu...');
		
		// Create a test Card Break Menu element
		const testCardMenu = {
			name: 'test-accounting',
			label: 'Accounting',
			icon: 'fa fa-calculator',
			children: [
				{ label: 'Chart of Accounts', link_type: 'Doctype', link_to: 'Account' },
				{ label: 'Company', link_type: 'Doctype', link_to: 'Company' },
				{ label: 'Customer', link_type: 'Doctype', link_to: 'Customer' },
				{ label: 'Supplier', link_type: 'Doctype', link_to: 'Supplier' }
			]
		};
		
		const nav = document.getElementById("nt-nav");
		if (nav) {
			const section = document.createElement('div');
			section.className = 'nt-nav-section';
			section.innerHTML = '<h6 style="color: var(--nt-text); margin: 10px 0;">Test Card Break Menu</h6>';
			
			const cardMenuElement = createCardBreakMenuElement(testCardMenu);
			section.appendChild(cardMenuElement);
			
			nav.appendChild(section);
			console.log('Test Card Break Menu added to sidebar');
		}
	};
	
	// Add function to clear and rebuild sidebar
	window.rebuildSidebar = function() {
		console.log('Rebuilding sidebar...');
		const nav = document.getElementById("nt-nav");
		if (nav) {
			nav.innerHTML = "";
			buildNav();
		}
	};
	
	// Add function to test Card Break Menu nesting
	window.testCardBreakNesting = function() {
		console.log('Testing Card Break Menu nesting...');
		
		// Find all Card Break Menu elements
		const cardBreakMenus = document.querySelectorAll('.nt-nav-sub-group');
		console.log('Found Card Break Menus:', cardBreakMenus.length);
		
		cardBreakMenus.forEach((menu, index) => {
			const header = menu.querySelector('.nt-nav-sub-head');
			const submenu = menu.querySelector('.nt-sublist-2');
			const subItems = menu.querySelectorAll('.nt-nav-sub-item-2');
			
			console.log(`Card Break Menu ${index + 1}:`);
			console.log(`  - Header: ${header ? header.textContent.trim() : 'Not found'}`);
			console.log(`  - Submenu visible: ${submenu ? submenu.style.display : 'Not found'}`);
			console.log(`  - Sub-items count: ${subItems.length}`);
			console.log(`  - Has open class: ${menu.classList.contains('open')}`);
			
			// Test clicking
			if (header) {
				console.log(`  - Testing click on: ${header.textContent.trim()}`);
				header.click();
				setTimeout(() => {
					console.log(`  - After click - Submenu visible: ${submenu ? submenu.style.display : 'Not found'}`);
					console.log(`  - After click - Has open class: ${menu.classList.contains('open')}`);
				}, 100);
			}
		});
	};
		
	// Removed singular Dashboard entry to avoid duplication with Dashboards group

		// Build generic module tree only if enabled
		if (SHOW_GENERIC_MODULES) {
    const modules = {};
    const canRead = new Set(window.frappe?.boot?.user?.can_read || []);
    const canCreate = new Set(window.frappe?.boot?.user?.can_create || []);
    const canWrite = new Set(window.frappe?.boot?.user?.can_write || []);
    const canDelete = new Set(window.frappe?.boot?.user?.can_delete || []);
    const doctypeList = (window.frappe?.boot?.user?.all_doctypes || []).filter((dt) => canRead.has(dt));
	doctypeList.forEach((dt) => {
		const module = (window.frappe?.boot?.doctype_module_map?.[dt]) || 'Other';
		modules[module] = modules[module] || { doctypes: [], reports: [], pages: [] };
		modules[module].doctypes.push(dt);
	});
	const reports = (window.frappe?.boot?.reports || []);
	reports.forEach((r) => {
		const module = r.module || 'Other';
		modules[module] = modules[module] || { doctypes: [], reports: [], pages: [] };
		modules[module].reports.push(r);
	});
	const pages = (window.frappe?.boot?.pages || []);
	pages.forEach((pg) => {
		const module = pg.module || 'Other';
		modules[module] = modules[module] || { doctypes: [], reports: [], pages: [] };
		modules[module].pages.push(pg);
	});

	let pinned = [];
	try { pinned = JSON.parse(localStorage.getItem('nt:sidebar') || '[]'); } catch (e) { pinned = []; }
	if (pinned.length) {
		const section = document.createElement('div');
		section.className = 'nt-nav-section';
		section.appendChild(Object.assign(document.createElement('div'), { className: 'nt-nav-label', textContent: 'Pinned' }));
		pinned.forEach((p) => {
			const name = p.name || p;
			const title = p.title || name;
			section.appendChild(navItem(title, () => frappe.router.set_route(name)));
		});
		nav.appendChild(section);
	}

	Object.keys(modules).sort().forEach((mod) => {
		const section = document.createElement('div');
		section.className = 'nt-nav-section';
		const header = document.createElement('div');
		header.className = 'nt-nav-label';
		header.textContent = mod;
		section.appendChild(header);
		(modules[mod].doctypes || []).sort().forEach((dt) => {
			const row = document.createElement('div');
			row.className = 'nt-nav-row';
			row.appendChild(navItem(dt, () => frappe.router.set_route('List', dt)));
			const actions = document.createElement('span');
			actions.className = 'nt-nav-actions';
			if (canCreate.has(dt)) {
				const addBtn = Object.assign(document.createElement('button'), { className: 'nt-btn', title: 'Add' });
				addBtn.textContent = '+';
				addBtn.onclick = (e) => { e.stopPropagation(); frappe.new_doc(dt); };
				actions.appendChild(addBtn);
			}
			if (canWrite.has(dt)) {
				const editBtn = Object.assign(document.createElement('button'), { className: 'nt-btn', title: 'Edit' });
				editBtn.textContent = '✏️';
				editBtn.onclick = (e) => { e.stopPropagation(); frappe.router.set_route('List', dt); };
				actions.appendChild(editBtn);
			}
			if (canDelete.has(dt)) {
				const delBtn = Object.assign(document.createElement('button'), { className: 'nt-btn', title: 'Delete' });
				delBtn.textContent = '🗑️';
				delBtn.onclick = (e) => { e.stopPropagation(); frappe.router.set_route('List', dt); };
				actions.appendChild(delBtn);
			}
			row.appendChild(actions);
			section.appendChild(row);
		});
		(modules[mod].reports || []).forEach((r) => {
			const label = r.name || r.report_name || 'Report';
			section.appendChild(navItem(label, () => frappe.router.set_route('query-report', label)));
		});
		(modules[mod].pages || []).forEach((pg) => {
			const label = pg.title || pg.name;
			section.appendChild(navItem(label, () => frappe.router.set_route('page', pg.name)));
		});
		nav.appendChild(section);
	});
		}

	// Workspace-based Sidebar System (Lazy load per Workspace using Link Cards)
    (function addWorkspaceSidebar() {
        if (HIDE_WORKSPACES) return; // skip rendering workspaces
        const allowed = window.frappe?.boot?.allowed_workspaces || [];
        if (!allowed.length) return;
        const section = document.createElement('div');
        section.className = 'nt-nav-section';
        allowed.forEach(ws => {
            const el = createWorkspaceLazyElement(ws);
            section.appendChild(el);
        });
        nav.appendChild(section);
    })();

	function addSidebarTools(nav) {
		const tools = document.createElement('div');
		tools.className = 'nt-sidebar-tools';
	tools.innerHTML = `
		<div class="nt-sidebar-tools-row">
			<input id="nt-sidebar-search" class="nt-input nt-sidebar-search" placeholder="Search menu..." />
		</div>
		<div class="nt-sidebar-tools-row buttons">
			<button id="nt-expand-all" class="nt-btn nt-btn-xs">Expand All</button>
			<button id="nt-collapse-all" class="nt-btn nt-btn-xs">Collapse All</button>
		</div>
	`;
		nav.appendChild(tools);

		const input = tools.querySelector('#nt-sidebar-search');
		if (input) {
			let t;
			input.addEventListener('input', () => {
				clearTimeout(t);
				t = setTimeout(() => filterSidebar(input.value || ''), 120);
			});
			// Re-filter after lazy workspace loads
			document.addEventListener('nt:ws-loaded', () => {
				const q = (input.value || '').trim();
				if (q) filterSidebar(q);
			});
		}
		const exp = tools.querySelector('#nt-expand-all');
		const col = tools.querySelector('#nt-collapse-all');
		if (exp) exp.onclick = () => toggleAll(true);
		if (col) col.onclick = () => toggleAll(false);
	}

	function toggleAll(open) {
		// Toggle top-level groups
		document.querySelectorAll('.nt-nav-group').forEach(g => {
			g.classList.toggle('open', !!open);
			// Ensure primary sublist visibility matches state
			const sub = g.querySelector('.nt-sublist');
			if (sub) sub.style.display = open ? 'block' : 'none';
			// If this is a lazy workspace group and we're expanding, ensure it is loaded
			if (open && !g.getAttribute('data-loaded')) {
				const name = g.getAttribute('data-ws-name');
				if (name && sub) {
					try {
						// Fire and forget; when done, mark as loaded
						fetchAndRenderWorkspaceGroups(name, sub).then(() => {
							g.setAttribute('data-loaded', '1');
							try { document.dispatchEvent(new Event('nt:ws-loaded')); } catch (e) {}
						}).catch(() => {});
					} catch (e) {}
				}
			}
		});
		// Toggle sub-groups, but skip the Dashboards group
		document.querySelectorAll('.nt-nav-sub-group').forEach(g => {
			const head = g.querySelector('.nt-nav-sub-head');
			const isDash = /dashboards/i.test((head?.textContent || ''));
			if (isDash) return;
			g.classList.toggle('open', !!open);
			const sub = g.querySelector('.nt-sublist-2');
			if (sub) sub.style.display = open ? 'block' : 'none';
			// rotate chevron to reflect state if present
			const chev = head && head.querySelector('.nt-chevron');
			if (chev) chev.style.transform = open ? 'rotate(90deg)' : 'rotate(0)';
		});
	}

	function filterSidebar(q) {
		const query = (q || '').toLowerCase().trim();
		const moduleGroups = Array.from(document.querySelectorAll('.nt-nav-group'));
		if (!query) {
			moduleGroups.forEach(g => {
				g.style.display = '';
				// restore all items visibility
				Array.from(g.querySelectorAll('.nt-nav-sub-item, .nt-nav-sub-item-2')).forEach(i => i.style.display = '');
			});
			return;
		}
		let firstHitEl = null;
		moduleGroups.forEach(g => {
			const head = g.querySelector('.nt-nav-head');
			const label = (head?.textContent || '').toLowerCase();
			const sub = g.querySelector('.nt-sublist');
			let matchHeader = label.includes(query);
			const items = Array.from(g.querySelectorAll('.nt-nav-sub-item, .nt-nav-sub-item-2'));
			let matchItem = null;
			items.forEach(i => {
				const text = (i.textContent || '').toLowerCase();
				const ok = text.includes(query);
				i.style.display = ok ? '' : 'none';
				if (ok && !matchItem) matchItem = i;
			});
			// filter nested card-break submenus inside this group
			const subGroups = Array.from(g.querySelectorAll('.nt-nav-sub-group'));
			subGroups.forEach(sg => {
				const sgHead = sg.querySelector('.nt-nav-sub-head');
				const sgLabel = (sgHead?.textContent || '').toLowerCase();
				const sgItems = Array.from(sg.querySelectorAll('.nt-sublist-2 .nt-nav-sub-item-2'));
				let sgMatch = sgLabel.includes(query);
				let sgItemHit = null;
				sgItems.forEach(it => {
					const t = (it.textContent || '').toLowerCase();
					const ok = t.includes(query);
					it.style.display = ok ? '' : 'none';
					if (ok && !sgItemHit) sgItemHit = it;
				});
				const any = sgMatch || !!sgItemHit;
				sg.style.display = any ? '' : 'none';
				if (any) {
					sg.classList.add('open');
					const sgSub = sg.querySelector('.nt-sublist-2');
					if (sgSub) sgSub.style.display = 'block';
					if (!matchItem && sgItemHit) matchItem = sgItemHit;
				}
			});
			const match = matchHeader || !!matchItem;
			g.style.display = match ? '' : 'none';
			if (matchItem) {
				g.classList.add('open');
				if (sub) sub.style.display = 'block';
				if (!firstHitEl) firstHitEl = matchItem;
			}
		});
		try { firstHitEl && firstHitEl.scrollIntoView({ block: 'nearest' }); } catch (e) {}
	}

	function createWorkspaceLazyElement(ws) {
		const workspaceDiv = document.createElement('div');
		workspaceDiv.className = 'nt-nav-group';
		// mark to help toggleAll eager-load when expanding all
		if (ws && (ws.name || ws.title)) {
			workspaceDiv.setAttribute('data-ws-name', ws.name || ws.title);
		}
		const header = document.createElement('a');
		header.className = 'nt-nav-item nt-nav-head';
		header.href = 'javascript:void(0)';
		header.innerHTML = `
			${ws.icon ? `<span class="nt-icon">${renderIconHtml(ws.icon, 'sm')}</span>` : ''}
			${ws.title || ws.name}
		`;
		const submenu = document.createElement('div');
		submenu.className = 'nt-sublist';
		const wsKey = `nt:ws-open:${ws.name || ws.title}`;
		if (localStorage.getItem(wsKey) === '1') {
			workspaceDiv.classList.add('open');
		}
		header.onclick = async () => {
			workspaceDiv.classList.toggle('open');
			localStorage.setItem(wsKey, workspaceDiv.classList.contains('open') ? '1' : '0');
			if (!workspaceDiv.getAttribute('data-loaded')) {
				await fetchAndRenderWorkspaceGroups(ws.name || ws.title, submenu);
				workspaceDiv.setAttribute('data-loaded', '1');
			}
		};
		workspaceDiv.appendChild(header);
		workspaceDiv.appendChild(submenu);
		return workspaceDiv;
	}

	async function fetchAndRenderWorkspaceGroups(name, container) {
		if (!name || !container) return;
		try {
			const r = await frappe.call({
				method: 'frappe.client.get',
				args: { doctype: 'Workspace', name }
			});
			const doc = r && r.message;
			if (!doc) return;
			const groups = groupWorkspaceLinksByCardBreak(doc.links || []);
			groups.forEach(g => {
				const groupEl = createCardBreakMenuElement({ label: g.title, icon: '', children: g.items });
				container.appendChild(groupEl);
			});
		} catch (e) {
			console.warn('Failed to load workspace', name, e);
		}
	}

	function groupWorkspaceLinksByCardBreak(links) {
		const out = [];
		let current = null;
		const pushGroup = (title) => {
			current = { title: title || 'Links', items: [] };
			out.push(current);
		};
		(links || []).forEach(l => {
			const t = (l.type || '').toString();
			if (t.toLowerCase() === 'card break' || t.toLowerCase() === 'card_break' || t.toLowerCase() === 'cardbreak') {
				pushGroup(l.label || 'Group');
				return;
			}
			// Collect only Link rows
			if (!current) pushGroup('Links');
			if (t.toLowerCase() === 'link' || !t) {
				const lt = (l.link_type || l.type || '').toString();
				const normalized = lt.toLowerCase();
				let link_type = 'Link';
				if (normalized === 'doctype') link_type = 'Doctype';
				else if (normalized === 'page') link_type = 'Page';
				else if (normalized === 'report') link_type = 'Report';
				else if (normalized === 'workspace') link_type = 'Workspace';
				current.items.push({
					label: l.label || l.link_to || 'Link',
					link_type,
					link_to: l.link_to || l.url || '',
					icon: l.icon || '',
					sort_order: Number(l.idx || 0)
				});
			}
		});
		// sort items within groups by sort_order then label
		out.forEach(g => g.items.sort((a,b)=> (a.sort_order-b.sort_order) || String(a.label).localeCompare(String(b.label))));
		return out;
	}
	
	function loadGlobalCardBreakMenus() {
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Card Break Menu',
				filters: {'is_active': 1},
				fields: ['name', 'menu_name', 'menu_icon', 'sort_order', 'description']
			},
			callback: function(r) {
				if (r.message && r.message.length > 0) {
					console.log('Loading global Card Break Menus:', r.message);
					const nav = document.getElementById("nt-nav");
					if (nav) {
						const section = document.createElement('div');
						section.className = 'nt-nav-section';
						
						r.message.forEach(cardMenu => {
							// Get the sub-menu items for this Card Break Menu
							frappe.call({
								method: 'frappe.client.get',
								args: {
									doctype: 'Card Break Menu',
									name: cardMenu.name
								},
								callback: function(cardMenuResponse) {
									if (cardMenuResponse.message) {
										const cardMenuData = {
											name: cardMenu.name,
											label: cardMenu.menu_name,
											icon: cardMenu.menu_icon,
											description: cardMenu.description,
											children: []
										};
										
										// Add sub-menu items
										if (cardMenuResponse.message.sub_menu_items) {
											cardMenuData.children = cardMenuResponse.message.sub_menu_items.map(item => ({
												label: item.item_label,
												link_type: item.link_type,
												link_to: item.link_to,
												icon: item.icon,
												sort_order: item.sort_order
											}));
										}
										
										console.log('Creating global Card Break Menu:', cardMenuData);
										const cardMenuElement = createCardBreakMenuElement(cardMenuData);
										section.appendChild(cardMenuElement);
									}
								}
							});
						});
						
						nav.appendChild(section);
					}
				}
			}
		});
	}
	
	function createWorkspaceElement(workspace) {
		const workspaceDiv = document.createElement('div');
		workspaceDiv.className = 'nt-nav-group';
		
		// Create workspace header
		const header = document.createElement('a');
		header.className = 'nt-nav-item nt-nav-head';
		header.href = 'javascript:void(0)';
		header.innerHTML = `
			${workspace.icon ? `<i class="${workspace.icon}"></i> ` : ''}
			${workspace.label}
		`;
		
		// Create submenu container
		const submenu = document.createElement('div');
		submenu.className = 'nt-sublist';
		
		// Add click handler for workspace header
		header.onclick = () => {
			workspaceDiv.classList.toggle('open');
		};
		


		// Consistent UX: if no Card Break Menus are available for this workspace,
		// group its workspace links under a collapsible "Links" section (pseudo card-break).
		const willUseCardBreak = Array.isArray(workspace.sub_menus) && workspace.sub_menus.length > 0;
		if (!willUseCardBreak && workspace.workspace_links && workspace.workspace_links.length > 0) {
			const pseudoCard = {
				label: 'Links',
				icon: workspace.icon || '',
				children: (workspace.workspace_links || []).map(l => ({
					label: l.label,
					link_type: (l.link_type === 'DocType') ? 'Doctype' : (l.link_type || ''),
					link_to: l.link_to,
					icon: l.icon || ''
				}))
			};
			const el = createCardBreakMenuElement(pseudoCard);
			submenu.appendChild(el);
		}
		

		
		// Add Card Break Menu sub-menus - these create expandable sections
		if (workspace.sub_menus && workspace.sub_menus.length > 0) {
			const wsLabel = (workspace.label || workspace.name || '').toString();
			const filteredMenus = workspace.sub_menus.filter(m => {
				const mlab = (m.label || m.name || '').toString();
				return mlab === wsLabel; // show only menu that matches workspace name
			});
			console.log('Adding filtered Card Break Menus to workspace:', wsLabel, filteredMenus);
			filteredMenus.forEach(cardMenu => {
				const cardMenuElement = createCardBreakMenuElement(cardMenu);
				submenu.appendChild(cardMenuElement);
			});
		} else {
			console.log('No Card Break Menus found for workspace:', workspace.label);
			// Fallback: fetch Card Break Menus and append under specific workspaces
			try {
				const wsName = (workspace.name || workspace.label || '').toString();
				appendCardBreakMenusTo(submenu, wsName);
			} catch (e) {
				console.warn('Failed to append Card Break Menus for workspace', workspace, e);
			}
		}
		
		workspaceDiv.appendChild(header);
		workspaceDiv.appendChild(submenu);
		
		return workspaceDiv;
	}
	
	function createWorkspaceLinkElement(link) {
		const linkElement = document.createElement('div');
		linkElement.className = 'nt-nav-item nt-nav-sub-item';
		linkElement.innerHTML = `
			${link.icon ? `<span class="nt-icon">${renderIconHtml(link.icon, 'sm')}</span>` : ''}
			${link.label}
		`;
		
		linkElement.onclick = () => {
			navigateToWorkspaceLink(link);
		};
		
		return linkElement;
	}
	
	function createCardBreakMenuElement(cardMenu) {
		console.log('Creating Card Break Menu:', cardMenu);
		
		const cardMenuDiv = document.createElement('div');
		cardMenuDiv.className = 'nt-nav-sub-group';
		
		// Create card menu header
		const header = document.createElement('a');
		header.className = 'nt-nav-item nt-nav-sub-head';
		header.href = 'javascript:void(0)';
		header.innerHTML = `
			${cardMenu.icon ? `<span class="nt-icon">${renderIconHtml(cardMenu.icon, 'sm')}</span>` : ''}
			${cardMenu.label}
			<span class="nt-chevron">▶</span>
		`;
		applyAccentToHeader(header, cardMenu.label || '');
		
		// Create submenu container for card menu items
		const submenu = document.createElement('div');
		submenu.className = 'nt-sublist-2';
		submenu.style.display = 'none'; // Ensure it's hidden by default
		submenu.style.marginLeft = '20px'; // Add indentation
		submenu.style.paddingLeft = '0';
		
		// Add click handler for card menu header
		const cbKey = `nt:cb-open:${cardMenu.label}`;
		if (localStorage.getItem(cbKey) === '1') {
			cardMenuDiv.classList.add('open');
			submenu.style.display = 'block';
			header.querySelector('span').style.transform = 'rotate(90deg)';
		}
		header.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			console.log('Card Break Menu clicked:', cardMenu.label);
			
			// Toggle the open class
			cardMenuDiv.classList.toggle('open');
			localStorage.setItem(cbKey, cardMenuDiv.classList.contains('open') ? '1' : '0');
			
			// Manually toggle visibility
			if (cardMenuDiv.classList.contains('open')) {
				submenu.style.display = 'block';
				header.querySelector('span').style.transform = 'rotate(90deg)';
			} else {
				submenu.style.display = 'none';
				header.querySelector('span').style.transform = 'rotate(0deg)';
			}
		};
		
		// Add card menu items (sub-menu items)
		if (cardMenu.children && cardMenu.children.length > 0) {
			console.log('Adding children to Card Break Menu:', cardMenu.children);
			cardMenu.children.forEach((item, index) => {
				console.log(`Adding child ${index + 1}:`, item);
				const itemElement = createCardBreakMenuItemElement(item);
				submenu.appendChild(itemElement);
			});
			console.log('Submenu after adding children:', submenu);
		} else {
			console.log('No children found for Card Break Menu:', cardMenu.label);
		}
		
		cardMenuDiv.appendChild(header);
		cardMenuDiv.appendChild(submenu);
		
		return cardMenuDiv;
	}

	function applyAccentToHeader(headerEl, label) {
		if (!headerEl) return;
		// No dynamic colors in sidebar; keep flat theme background
		headerEl.style.borderLeft = "none";
		headerEl.style.backgroundImage = "none";
	}

	function colorFromString(str) {
		let h = 0;
		for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
		return h % 360;
	}

	// Helper: fetch Card Break Menus and append to a given container
	function appendCardBreakMenusTo(containerEl, workspaceLabel) {
		if (!containerEl) return;
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Card Break Menu',
				filters: { 'is_active': 1 },
				fields: ['name', 'menu_name', 'menu_icon', 'sort_order', 'description']
			},
			callback: function(r) {
				if (r.message && r.message.length > 0) {
					r.message.forEach(cardMenu => {
						// only attach the menu that matches this workspace's label/name
						if (workspaceLabel && cardMenu.menu_name !== workspaceLabel) return;
						frappe.call({
							method: 'frappe.client.get',
							args: { doctype: 'Card Break Menu', name: cardMenu.name },
							callback: function(cardMenuResponse) {
								if (cardMenuResponse.message) {
									const cardMenuData = {
										name: cardMenu.name,
										label: cardMenu.menu_name,
										icon: cardMenu.menu_icon,
										description: cardMenu.description,
										children: []
									};
									if (cardMenuResponse.message.sub_menu_items) {
										cardMenuData.children = cardMenuResponse.message.sub_menu_items.map(item => ({
											label: item.item_label,
											link_type: item.link_type,
											link_to: item.link_to,
											icon: item.icon,
											sort_order: item.sort_order
										}));
									}
									const el = createCardBreakMenuElement(cardMenuData);
									containerEl.appendChild(el);
								}
							}
						});
					});
				}
			}
		});
	}
	
	function createCardBreakMenuItemElement(item) {
		console.log('Creating Card Break Menu Item:', item);
		
		const itemElement = document.createElement('div');
		itemElement.className = 'nt-nav-item nt-nav-sub-item-2';
		const iconHtml = item.icon ? renderIconHtml(item.icon, 'sm') : '';
		itemElement.innerHTML = `
			${iconHtml ? `<span class=\"nt-icon\">${iconHtml}</span>` : ''}
			${item.label}
		`;
		
		itemElement.onclick = () => {
			console.log('Card Break Menu Item clicked:', item.label);
			setActiveNavItem(itemElement);
			navigateToCardBreakMenuItem(item);
		};
		
		return itemElement;
	}
	
	function createMenuElement(menuItem) {
		const menuDiv = document.createElement('div');
		menuDiv.className = 'nt-nav-group';
		
		// Create menu header
		const header = document.createElement('a');
		header.className = 'nt-nav-item nt-nav-head';
		header.href = 'javascript:void(0)';
		header.innerHTML = `
			${menuItem.icon ? `<i class="${menuItem.icon}"></i> ` : ''}
			${menuItem.label}
		`;
		
		// Create submenu container
		const submenu = document.createElement('div');
		submenu.className = 'nt-sublist';
		
		// Add click handler for menu header
		header.onclick = () => {
			menuDiv.classList.toggle('open');
		};
		
		// Add submenu items
		if (menuItem.children && menuItem.children.length > 0) {
			menuItem.children.forEach(child => {
				const childElement = createSubMenuElement(child);
				submenu.appendChild(childElement);
			});
		} else if (menuItem.route) {
			// If no children but has route, make it clickable
			header.onclick = () => {
				navigateToRoute(menuItem.route, menuItem.type);
			};
		}
		
		menuDiv.appendChild(header);
		menuDiv.appendChild(submenu);
		
		return menuDiv;
	}
	
	function createSubMenuElement(subItem) {
		const subElement = document.createElement('div');
		subElement.className = 'nt-nav-item nt-nav-sub-item';
		subElement.innerHTML = `
			${subItem.icon ? `<i class="${subItem.icon}"></i> ` : ''}
			${subItem.label}
		`;
		
		subElement.onclick = () => {
			if (subItem.route) {
				setActiveNavItem(subElement);
				navigateToRoute(subItem.route, subItem.type);
			}
		};
		
		return subElement;
	}
	
	function navigateToWorkspaceLink(link) {
		if (!link) return;
		
		switch(link.link_type) {
			case 'DocType':
				frappe.router.set_route('List', link.link_to);
				break;
			case 'Page':
				frappe.router.set_route('page', link.link_to);
				break;
			case 'Report':
				if (link.is_query_report) {
					frappe.router.set_route('query-report', link.link_to);
				} else {
					frappe.router.set_route('report', link.link_to);
				}
				break;
			case 'Link':
				window.open(link.link_to, '_blank');
				break;
			case 'Workspace':
				frappe.router.set_route('workspace', link.link_to);
				break;
			default:
				// Try to navigate to workspace if it's a workspace link
				if (link.link_to) {
					frappe.router.set_route('workspace', link.link_to);
				}
		}
	}

	function setActiveNavItem(el) {
		try {
			document.querySelectorAll('.nt-nav-item.nt-active').forEach(n => n.classList.remove('nt-active'));
			el.classList.add('nt-active');
		} catch (e) {}
	}

	// helpers: icon renderer (prefers frappe SVG icons, falls back to <i class="..."></i>)
	function renderIconHtml(iconName, size) {
		try {
			if (window.frappe?.utils?.icon) {
				return window.frappe.utils.icon(iconName, size || 'sm');
			}
			// fallback to class-based icon
			return `<i class="${iconName}"></i>`;
		} catch (e) {
			return `<i class="${iconName}"></i>`;
		}
	}
	
	function navigateToCardBreakMenuItem(item) {
		if (!item) return;
		
		switch(item.link_type) {
			case 'Doctype':
				frappe.router.set_route('List', item.link_to);
				break;
			case 'Page':
				frappe.router.set_route('page', item.link_to);
				break;
			case 'Report':
				frappe.router.set_route('query-report', item.link_to);
				break;
			case 'Link':
				window.open(item.link_to, '_blank');
				break;
			case 'Workspace':
				frappe.router.set_route('workspace', item.link_to);
				break;
			default:
				// Try to navigate to workspace if it's a workspace link
				if (item.link_to) {
					frappe.router.set_route('workspace', item.link_to);
				}
		}
	}
	
	function navigateToRoute(route, type) {
		if (!route) return;
		
		const routeParts = route.split('/');
		
		switch(type) {
			case 'Doctype':
				frappe.router.set_route('List', routeParts[0]);
				break;
			case 'Page':
				frappe.router.set_route('page', routeParts[0]);
				break;
			case 'Report':
				frappe.router.set_route('query-report', routeParts[0]);
				break;
			case 'Link':
				window.open(route, '_blank');
				break;
			default:
				frappe.router.set_route(...routeParts);
		}
	}

		// bottom dock (icon-only)
		const layout = (window.frappe?.boot?.new_theme_settings?.desk_layout || "Left Sidebar").toLowerCase();
		if (layout === "bottom dock") {
			let dock = document.getElementById("nt-dock");
			if (!dock) {
				dock = document.createElement("div");
				dock.id = "nt-dock";
				dock.className = "nt-dock";
				document.body.appendChild(dock);
			}
			// show pinned in dock
			dock.innerHTML = (pinned.length ? pinned : [])
				.slice(0, 8)
				.map((p) => {
					const label = (p.title || p.name || '').split(' ')[0].slice(0, 3) || 'Go';
					return `<a class="nt-dock-item" href="javascript:void(0)">${label}</a>`;
				})
				.join("");
		}
	}

	function placeContentPortal() {
		const host = document.getElementById("nt-content");
		if (!host) return;
		const deskContainer = document.querySelector(".desk-container, .page-container, .container.page-body");
		if (!deskContainer) return;
		if (!host.contains(deskContainer)) {
			host.innerHTML = "";
			host.appendChild(deskContainer);
		}

		// route-based body classes and width
		const route = (window.frappe?.router?.current_route || []).join("/") || location.hash;
		const isList = /(^|\/)list(\b|\/)/i.test(route);
		const isForm = /Form|doctype/i.test(route);
		const isWorkspace = /workspace/i.test(route);
		// Keep default Frappe list view; do not apply our list overrides
		document.body.classList.remove("nt-list");
		document.body.classList.toggle("nt-form", isForm);
		document.body.classList.toggle("nt-workspace", isWorkspace);
		// Always run brandless so our custom topbar is the only navbar
		document.body.classList.add("nt-brandless");

		const width = (window.frappe?.boot?.new_theme_settings?.content_width || "Wide").toLowerCase();
		document.body.classList.toggle("nt-width-wide", width === "wide");
		document.body.classList.toggle("nt-width-medium", width === "medium");
		document.body.classList.toggle("nt-width-narrow", width === "narrow");
	}

	function buildFavorites() {
		const bar = document.getElementById("nt-favbar");
		if (!bar) return;
		const favs = JSON.parse(localStorage.getItem("nt:favs") || "[]");
		bar.innerHTML = favs.map((f) => `<a class="nt-fav" href="#${f.route}">⭐ ${f.label}</a>`).join("");
	}

function buildRecents() {
	const bar = document.getElementById('nt-recents');
	if (!bar) return;
	const items = JSON.parse(localStorage.getItem('nt:recents') || '[]').slice(0, 12);
	bar.innerHTML = items.map((r) => `<a class="nt-chip" href="#${r.route}">${r.label}</a>`).join('');
}

// Resolve the best available user avatar URL
function getUserAvatarUrl() {
	const sessionUser = window.frappe?.session?.user;
	try {
		const info = sessionUser && window.frappe?.user_info ? window.frappe.user_info(sessionUser) : null;
		const img = (info && info.image) || window.frappe?.boot?.user?.image;
		if (img && String(img).trim()) return img;
	} catch (e) {}
	try {
		const email = (window.frappe?.boot?.user && window.frappe.boot.user.email) || sessionUser;
		if (email && window.frappe?.get_gravatar) return frappe.get_gravatar(email, 64) + "";
	} catch (e) {}
	return '/assets/frappe/images/ui/user-avatar-standard.svg';
}

/** Build user dropdown (Account / Logout) in topbar */
function buildUserWidget() {
	const host = document.getElementById("nt-user");
	if (!host) return;
	host.innerHTML = `
		<div class="nt-dropdown" id="nt-profile" aria-label="Account">
			<div class="nt-btn" id="nt-profile-btn" title="Account">
				<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" focusable="false">
					<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"></circle>
					<path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
				</svg>
			</div>
			<div class="nt-menu" id="nt-profile-menu">
				<div class="nt-item" data-action="profile">My Account</div>
				<div class="nt-sep"></div>
				<div class="nt-item" data-action="logout">Logout</div>
			</div>
		</div>`;
}

	function refreshUser() {
	const user = window.frappe?.boot?.user;
	const profileMenu = document.getElementById("nt-profile-menu");
	const dropdown = document.getElementById("nt-profile");
	if (dropdown && profileMenu && user) {
		dropdown.onclick = () => profileMenu.classList.toggle("nt-open");
		profileMenu.addEventListener("click", (e) => {
			const item = e.target.closest(".nt-item");
			if (!item) return;
			const action = item.getAttribute("data-action");
			if (action === "profile") frappe.set_route("Form", "User", (window.frappe?.session?.user || user.name));
			if (action === "settings") frappe.set_route("Form", "User", (window.frappe?.session?.user || user.name));
			if (action === "logout") frappe.app.logout();
		});
	}

		// Command palette
		const cmd = document.getElementById("nt-cmdk");
		if (cmd) {
			cmd.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					const q = cmd.value || "";
					window.frappe?.searchdialog?.search?.init_search(q, "global_search");
				}
			});
			document.addEventListener("keydown", (e) => {
				if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
					e.preventDefault();
					cmd.focus();
				}
			});
		}

		// Quick create
		const quickBtn = document.getElementById("nt-quick-create-btn");
		const quickMenu = document.getElementById("nt-quick-menu");
		if (quickBtn && quickMenu) {
			const createables = (window.frappe?.boot?.user?.all_modules || []).slice(0, 6);
			quickMenu.innerHTML = (createables || [])
				.map((m) => `<div class="nt-item" data-doctype="${m}">Create ${m}</div>`) 
				.join("");
			quickBtn.onclick = () => quickMenu.classList.toggle("nt-open");
			quickMenu.onclick = (e) => {
				const el = e.target.closest(".nt-item");
				if (!el) return;
				const doctype = el.getAttribute("data-doctype");
				window.frappe?.ui?.form?.make_quick_entry?.(doctype);
				quickMenu.classList.remove("nt-open");
			};
		}

		// Add New mega grid
		const addNewBtn = document.getElementById("nt-addnew-btn");
		const addNewMenu = document.getElementById("nt-addnew-menu");
		const addNewGrid = document.getElementById("nt-addnew-grid");
		if (addNewBtn && addNewMenu && addNewGrid) {
			// Build dynamic list based on user's create permissions
			const userBoot = window.frappe?.boot || {};
			const canCreateArr = (userBoot.user && userBoot.user.can_create) || [];
			const inCreateArr = (userBoot.user && userBoot.user.in_create) || [];
			// Friendly labels and icons for a few common doctypes
			const iconMap = {
				"Item Group": { icon: "es-line-list-details", label: "Category" },
				"Item": { icon: "es-line-shopping-bag", label: "Product" },
				"Purchase Invoice": { icon: "es-line-shopping-bag", label: "Purchase" },
				"Sales Invoice": { icon: "es-line-shopping-cart", label: "Sale" },
				"Expense Claim": { icon: "es-line-file-text", label: "Expense" },
				"Quotation": { icon: "es-line-files", label: "Quotation" },
				"Sales Return": { icon: "es-line-copy", label: "Return" },
				"User": { icon: "es-line-user", label: "User" },
				"Customer": { icon: "es-line-users", label: "Customer" },
				"Sales Partner": { icon: "es-line-shield", label: "Biller" },
				"Supplier": { icon: "es-line-user-check", label: "Supplier" },
				"Stock Entry": { icon: "es-line-truck", label: "Transfer" },
			};

			// Union of creatable doctypes (works even if all_doctypes isn't present)
			const allowedToCreate = Array.from(new Set([...(canCreateArr || []), ...(inCreateArr || [])]));
			// Prefer a curated order for common items first, then the rest alphabetically
			const curated = [
				"Item Group",
				"Item",
				"Customer",
				"Supplier",
				"Sales Invoice",
				"Purchase Invoice",
				"Quotation",
				"Expense Claim",
				"Stock Entry",
			];
			const curatedItems = curated.filter((d) => allowedToCreate.includes(d));
			const remaining = allowedToCreate
				.filter((d) => !curated.includes(d))
				.sort((a, b) => String(a).localeCompare(String(b)));
			const finalList = [...curatedItems, ...remaining].slice(0, 24);

			addNewGrid.innerHTML = finalList
				.map((dt) => {
					const meta = iconMap[dt] || { icon: "es-line-file", label: frappe.model.unscrub(dt) };
					return `<div class="nt-grid-item" data-doctype="${dt}">
						<span class="nt-grid-icon"><svg class="es-icon icon-md"><use href="#${meta.icon}"></use></svg></span>
						<p>${meta.label}</p>
					</div>`;
				})
				.join("");

			addNewBtn.onclick = () => addNewMenu.classList.toggle("nt-open");
			addNewGrid.onclick = (e) => {
				const el = e.target.closest(".nt-grid-item");
				if (!el) return;
				const doctype = el.getAttribute("data-doctype");
				if (doctype) {
					window.frappe?.ui?.form?.make_quick_entry?.(doctype);
					addNewMenu.classList.remove("nt-open");
				}
			};
		}

		// POS quick button
		const posBtn = document.getElementById("nt-pos-btn");
		if (posBtn) {
			posBtn.onclick = () => {
				// Prefer ERPNext POS route if available
				const route = frappe?.router?.slug ? frappe.router.slug("Point of Sale") : "pos";
				frappe.set_route("pos");
			};
		}

		// Workspace dropdown actions
		const wsBtn = document.getElementById('nt-ws-btn');
		const wsMenu = document.getElementById('nt-ws-menu');
		if (wsBtn && wsMenu) {
			wsBtn.onclick = () => wsMenu.classList.toggle('nt-open');
			wsMenu.onclick = (e) => {
				const item = e.target.closest('.nt-item');
				if (!item) return;
				const action = item.getAttribute('data-action');
				if (action === 'ws-list') {
					frappe.set_route('List', 'Workspace');
				}
				if (action === 'ws-new') {
					frappe.new_doc('Workspace');
				}
				if (action === 'ws-edit-current') {
					try {
						const r = frappe.get_route && frappe.get_route();
						if (r && r[0] === 'workspace' && r[1]) {
							frappe.set_route('Form', 'Workspace', r[1]);
						} else {
							frappe.set_route('List', 'Workspace');
						}
					} catch (e) {
						frappe.set_route('List', 'Workspace');
					}
				}
				wsMenu.classList.remove('nt-open');
			};
		}

		// Language dropdown (switch preference route)
		const langBtn = document.getElementById("nt-lang-btn");
		const langMenu = document.getElementById("nt-lang-menu");
		if (langBtn && langMenu) {
			langBtn.onclick = () => langMenu.classList.toggle("nt-open");
			langMenu.onclick = (e) => {
				const item = e.target.closest(".nt-item[data-lang]");
				if (!item) return;
				const lang = item.getAttribute("data-lang");
				// Route to language settings for now
				frappe.set_route("Form", "System Settings");
				langMenu.classList.remove("nt-open");
			};
		}

		// Notifications with All / Unread tabs
		const bell = document.getElementById("nt-bell");
		const bellMenu = document.getElementById("nt-bell-menu");
		const badge = document.getElementById("nt-badge");
		if (bell && bellMenu) {
			bell.onclick = () => bellMenu.classList.toggle("nt-open");
			const render = () => {
				frappe
					.call("frappe.desk.doctype.notification_log.notification_log.get_notification_logs", { limit: 20 })
					.then((r) => {
						const logs = (r && r.message && r.message.notification_logs) || [];
						const unread = logs.filter((n) => !(n.read || n.seen));
						badge.style.display = logs.length ? "inline-block" : "none";
						badge.textContent = String(Math.min(unread.length || logs.length, 9));
						const renderList = (arr) =>
							arr
								.map(
									(n) => `<a class="nt-item" href="${frappe.utils.get_form_link(n.document_type || 'Notification Log', n.document_name || n.name)}">
										<div class="nt-item-title">${n.subject}</div>
										<div class="nt-item-sub">${frappe.datetime.comment_when(n.creation)}</div>
									</a>`
								)
								.join("") || `<div class="nt-empty">No notifications</div>`;

						bellMenu.innerHTML = `
							<div class="nt-tabs">
								<button class="nt-tab nt-tab-all active" data-tab="all">All</button>
								<button class="nt-tab nt-tab-unread" data-tab="unread">Unread</button>
							</div>
							<div class="nt-tab-body">
								<div class="nt-tab-pane nt-pane-all">${renderList(logs)}</div>
								<div class="nt-tab-pane nt-pane-unread" style="display:none">${renderList(unread)}</div>
							</div>`;

						bellMenu.querySelector(".nt-tab-all").onclick = () => {
							bellMenu.querySelector(".nt-tab-all").classList.add("active");
							bellMenu.querySelector(".nt-tab-unread").classList.remove("active");
							bellMenu.querySelector(".nt-pane-all").style.display = "block";
							bellMenu.querySelector(".nt-pane-unread").style.display = "none";
						};
						bellMenu.querySelector(".nt-tab-unread").onclick = () => {
							bellMenu.querySelector(".nt-tab-unread").classList.add("active");
							bellMenu.querySelector(".nt-tab-all").classList.remove("active");
							bellMenu.querySelector(".nt-pane-unread").style.display = "block";
							bellMenu.querySelector(".nt-pane-all").style.display = "none";
						};
					});
			};
			render();
			frappe.realtime?.on?.("notification", render);
		}

		// Saved Views (per route key)
		const viewsBtn = document.getElementById("nt-views-btn");
		const viewsMenu = document.getElementById("nt-views-menu");
		const viewsList = document.getElementById("nt-views-list");
		if (viewsBtn && viewsMenu && viewsList) {
			const key = () => `nt:views:${(frappe?.router?.current_route || []).join('/')}`;
			const load = () => JSON.parse(localStorage.getItem(key()) || "[]");
			const saveAll = (arr) => localStorage.setItem(key(), JSON.stringify(arr));
			const render = () => {
				const arr = load();
				viewsList.innerHTML = arr.map((v, i) => `<div class="nt-item" data-i="${i}">${v.label}</div>`).join("");
			};
			viewsBtn.onclick = () => { viewsMenu.classList.toggle("nt-open"); render(); };
			viewsMenu.addEventListener("click", (e) => {
				const saveBtn = e.target.closest(".nt-item[data-action='save-view']");
				if (saveBtn) {
					const q = prompt("View name?");
					if (!q) return;
					const current = { label: q, route: location.hash.slice(1), filters: frappe?.listview_settings || {} };
					const arr = load(); arr.push(current); saveAll(arr); render();
					return;
				}
				const item = e.target.closest(".nt-item[data-i]");
				if (item) {
					const i = Number(item.getAttribute("data-i"));
					const arr = load(); const v = arr[i];
					if (v?.route) frappe.router.set_route(v.route);
					viewsMenu.classList.remove("nt-open");
				}
			});
		}

		// Pin star toggle
		const star = document.getElementById("nt-star");
		if (star) {
			const favKey = "nt:favs";
			const list = () => JSON.parse(localStorage.getItem(favKey) || "[]");
			const write = (arr) => localStorage.setItem(favKey, JSON.stringify(arr));
			const curr = () => ({ label: document.title || (frappe?.router?.current_route || []).join('/'), route: (frappe?.router?.current_route || []).join('/') });
			const isPinned = () => list().some((f) => f.route === curr().route);
			const setStar = () => { star.textContent = isPinned() ? "★" : "☆"; };
			setStar();
			star.onclick = () => {
				let arr = list();
				if (isPinned()) arr = arr.filter((f) => f.route !== curr().route); else arr.push(curr());
				write(arr); setStar(); buildFavorites();
			};
		}

		// Sidebar edit (per-user) with select UI
		const sbEdit = document.getElementById("nt-sidebar-edit");
		const sbMenu = document.getElementById("nt-sidebar-menu");
		if (sbEdit && sbMenu) {
			const renderSidebarEditor = () => {
				const all = (window.frappe?.boot?.allowed_workspaces || []).map((w) => ({ name: w.name, title: w.title || w.name }));
				let selected = [];
				try { selected = JSON.parse(localStorage.getItem('nt:sidebar') || '[]'); } catch (e) { selected = []; }
				const selectedNames = new Set(selected.map((i) => i.name || i));
				const opts = all.map((w) => {
					const active = selectedNames.has(w.name);
					return `<div class="nt-item" data-name="${w.name}">${active ? '✓ ' : ''}${w.title}</div>`;
				}).join("");
				sbMenu.innerHTML = `
					<div class="nt-item" data-action="save">Save</div>
					<div class="nt-sep"></div>
					${opts}
				`;
			};
			sbEdit.onclick = () => { sbMenu.classList.toggle('nt-open'); renderSidebarEditor(); };
			sbMenu.onclick = (e) => {
				const save = e.target.closest('.nt-item[data-action="save"]');
				if (save) { sbMenu.classList.remove('nt-open'); buildNav(); return; }
				const item = e.target.closest('.nt-item[data-name]');
				if (!item) return;
				const name = item.getAttribute('data-name');
				let selected = [];
				try { selected = JSON.parse(localStorage.getItem('nt:sidebar') || '[]'); } catch (e) { selected = []; }
				const exists = selected.find((i) => (i.name || i) === name);
				if (exists) {
					selected = selected.filter((i) => (i.name || i) !== name);
				} else {
					const ws = (window.frappe?.boot?.allowed_workspaces || []).find((w) => w.name === name);
					selected.push({ name, title: (ws && (ws.title || ws.name)) || name });
				}
				localStorage.setItem('nt:sidebar', JSON.stringify(selected));
				renderSidebarEditor();
			};
		}

		// Custom nav collapse toggle
		const navToggleBtn = document.getElementById("nt-sidebar-toggle");
		if (navToggleBtn) {
			navToggleBtn.onclick = () => {
				const sidebar = document.querySelector(".nt-sidebar");
				const main = document.querySelector(".nt-main");
				if (!sidebar || !main) return;
				sidebar.classList.toggle("nt-collapsed");
				main.classList.toggle("nt-sidebar-collapsed");
				localStorage.setItem("nt:sidebar-collapsed", sidebar.classList.contains("nt-collapsed") ? "1" : "0");
			};
		}

		// List Filters toggle
		const filtersBtn = document.getElementById("nt-filters-toggle");
		if (filtersBtn) {
			filtersBtn.onclick = () => {
				document.body.classList.toggle("nt-hide-list-sidebar");
				localStorage.setItem("nt:hide-filters", document.body.classList.contains("nt-hide-list-sidebar") ? "1" : "0");
			};
		}

		// Split List + Form (simple iframe loader)
		const splitBtn = document.getElementById("nt-split-toggle");
		if (splitBtn) {
			splitBtn.onclick = () => {
				const content = document.getElementById("nt-content");
				if (!content) return;
				content.classList.toggle("nt-split");
				let pane = document.getElementById("nt-split-detail");
				if (!pane) {
					pane = document.createElement("div");
					pane.id = "nt-split-detail";
					pane.className = "nt-split-detail";
					pane.innerHTML = `<iframe id="nt-split-iframe"></iframe>`;
					content.appendChild(pane);
				}
				const list = document.querySelector(".result-list, .result");
				if (list) {
					list.addEventListener("click", (e) => {
						const row = e.target.closest(".list-row");
						if (!row) return;
						const name = row.getAttribute("data-name");
						if (!name) return;
						const doctype = frappe?.listview_settings?.doctype || (frappe?.route_options?.doctype);
						const url = doctype ? `/app/${frappe.router.slug(doctype)}/${name}` : location.href;
						const ifr = document.getElementById("nt-split-iframe");
						ifr && (ifr.src = url);
					}, { once: true });
				}
			};
		}

		// Theme toggle removed

		// Full screen toggle
		const fsBtn = document.getElementById('nt-fullscreen');
		if (fsBtn) {
			const updateLabel = () => {
				const entering = !document.fullscreenElement;
				fsBtn.setAttribute('data-state', entering ? 'enter' : 'exit');
				fsBtn.title = entering ? 'Full Screen' : 'Exit Full Screen';
				// toggle paths visibility by class
				const enterPath = fsBtn.querySelector('.nt-fs-enter');
				const exitPath = fsBtn.querySelector('.nt-fs-exit');
				if (enterPath && exitPath) {
					enterPath.style.display = entering ? 'block' : 'none';
					exitPath.style.display = entering ? 'none' : 'block';
				}
			};
			updateLabel();
			fsBtn.onclick = async () => {
				try {
					if (!document.fullscreenElement) {
						await document.documentElement.requestFullscreen();
					} else {
						await document.exitFullscreen();
					}
				} catch (e) {}
			};
			document.addEventListener('fullscreenchange', updateLabel);
		}

		function setRootVars(v) {
			const root = document.documentElement;
			if (v.bg) root.style.setProperty('--nt-bg', v.bg);
			if (v.surface) root.style.setProperty('--nt-surface', v.surface);
			if (v.surface2) root.style.setProperty('--nt-surface-2', v.surface2);
			if (v.text) root.style.setProperty('--nt-text', v.text);
			if (v.textDim) root.style.setProperty('--nt-text-dim', v.textDim);
			if (v.primary) root.style.setProperty('--nt-primary', v.primary);
			if (v.onPrimary) root.style.setProperty('--nt-primary-contrast', v.onPrimary);
			if (v.accent) root.style.setProperty('--nt-accent', v.accent);
			if (v.border) root.style.setProperty('--nt-border', v.border);
		}

		function hexToRgb(hex) {
			const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
			return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
		}

		function contrastOn(hex) {
			const rgb = hexToRgb(hex);
			if (!rgb) return '#ffffff';
			const { r, g, b } = rgb;
			const l = (0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255));
			return l > 0.55 ? '#0b0d12' : '#ffffff';
		}

		// Density controls removed; enforce default
		document.body.classList.remove('nt-density-compact', 'nt-density-touch');
		localStorage.removeItem('nt:density');

		// Width dropdown
		const widthBtn = document.getElementById("nt-width-btn");
		const widthMenu = document.getElementById("nt-width-menu");
		if (widthBtn && widthMenu) {
			widthBtn.onclick = () => widthMenu.classList.toggle("nt-open");
			widthMenu.onclick = (e) => {
				const item = e.target.closest('.nt-item[data-width]');
				if (!item) return;
				const w = item.getAttribute('data-width');
				document.body.classList.remove('nt-width-wide', 'nt-width-medium', 'nt-width-narrow');
				if (w === 'wide') document.body.classList.add('nt-width-wide');
				if (w === 'medium') document.body.classList.add('nt-width-medium');
				if (w === 'narrow') document.body.classList.add('nt-width-narrow');
				localStorage.setItem('nt:width', w);
				widthMenu.classList.remove('nt-open');
			};
		}

		// Theme presets dropdown
		const presetsBtn = document.getElementById('nt-theme-presets-btn');
		const presetsMenu = document.getElementById('nt-theme-presets-menu');
		if (presetsBtn && presetsMenu) {
			presetsBtn.onclick = () => presetsMenu.classList.toggle('nt-open');
			const applyPreset = (p) => {
				if (p === 'dark') setRootVars({ bg:'#0f1115', surface:'#151922', surface2:'#1b2130', text:'#e6e8ed', textDim:'#b7bdd0', primary:'#7c5cff', onPrimary: contrastOn('#7c5cff'), accent:'#22d3ee', border:'rgba(255,255,255,0.06)'});
				if (p === 'light') setRootVars({ bg:'#f6f7fb', surface:'#ffffff', surface2:'#f5f7fb', text:'#0f1115', textDim:'#4b5563', primary:'#3066fb', onPrimary: contrastOn('#3066fb'), accent:'#0ea5e9', border:'rgba(0,0,0,0.08)'});
				if (p === 'amoled') setRootVars({ bg:'#000000', surface:'#0b0b0b', surface2:'#111111', text:'#eaeaea', textDim:'#b3b3b3', primary:'#22d3ee', onPrimary: contrastOn('#22d3ee'), accent:'#7c5cff', border:'rgba(255,255,255,0.08)'});
				if (p === 'ocean') setRootVars({ bg:'#0b1020', surface:'#121a2d', surface2:'#0f172a', text:'#dfe8ff', textDim:'#9fb4ff', primary:'#2dd4bf', onPrimary: contrastOn('#2dd4bf'), accent:'#22d3ee', border:'rgba(255,255,255,0.08)'});
				if (p === 'forest') setRootVars({ bg:'#0e1411', surface:'#152019', surface2:'#0f1a13', text:'#d7fbe8', textDim:'#a7e8cc', primary:'#22c55e', onPrimary: contrastOn('#22c55e'), accent:'#16a34a', border:'rgba(255,255,255,0.06)'});
				if (p === 'sunset') setRootVars({ bg:'#1a0f14', surface:'#22151b', surface2:'#2a1921', text:'#ffe4e6', textDim:'#fecdd3', primary:'#fb7185', onPrimary: contrastOn('#fb7185'), accent:'#f59e0b', border:'rgba(255,255,255,0.06)'});
				if (p === 'rose') setRootVars({ bg:'#141013', surface:'#1b1519', surface2:'#231a20', text:'#fce7f3', textDim:'#f5c2e7', primary:'#f472b6', onPrimary: contrastOn('#f472b6'), accent:'#fb7185', border:'rgba(255,255,255,0.06)'});
				localStorage.setItem('nt:preset', p);
			};
			presetsMenu.onclick = (e) => {
				const item = e.target.closest('.nt-item[data-preset]');
				if (!item) return;
				applyPreset(item.getAttribute('data-preset'));
				presetsMenu.classList.remove('nt-open');
			};
		}

		// Customizer panel
		const customizeBtn = document.getElementById('nt-customize-btn');
		if (customizeBtn) {
			let panel = document.getElementById('nt-customizer');
			customizeBtn.onclick = () => {
				if (!panel) {
					panel = document.createElement('div');
					panel.id = 'nt-customizer';
					panel.className = 'nt-customizer';
					panel.innerHTML = `
						<div class="nt-customizer-head">
							<div>Theme Customizer</div>
							<button id="nt-customizer-close" class="nt-btn">✕</button>
						</div>
						<div class="nt-customizer-body">
							<label>Primary <input type="color" id="nt-cust-primary" /></label>
							<label>Accent <input type="color" id="nt-cust-accent" /></label>
							<label>Background <input type="color" id="nt-cust-bg" /></label>
							<label>Surface <input type="color" id="nt-cust-surface" /></label>
							<label>Text <input type="color" id="nt-cust-text" /></label>
							<label>Radius <input type="range" min="4" max="24" step="1" id="nt-cust-radius" /></label>
						</div>
						<div class="nt-customizer-foot">
							<button class="nt-btn" id="nt-cust-reset">Reset</button>
							<button class="nt-btn" id="nt-cust-apply">Apply</button>
						</div>`;
					document.body.appendChild(panel);
					// hydrate saved values
					const saved = JSON.parse(localStorage.getItem('nt:custom') || '{}');
					const setIf = (id, val) => { if (val) { const el = document.getElementById(id); if (el) el.value = val; } };
					setIf('nt-cust-primary', saved.primary);
					setIf('nt-cust-accent', saved.accent);
					setIf('nt-cust-bg', saved.bg);
					setIf('nt-cust-surface', saved.surface);
					setIf('nt-cust-text', saved.text);
					if (saved.radius) { const r = document.getElementById('nt-cust-radius'); if (r) r.value = String(saved.radius); }
					panel.querySelector('#nt-customizer-close').onclick = () => panel.classList.remove('open');
					panel.querySelector('#nt-cust-apply').onclick = () => {
						const vals = {
							primary: document.getElementById('nt-cust-primary').value,
							accent: document.getElementById('nt-cust-accent').value,
							bg: document.getElementById('nt-cust-bg').value,
							surface: document.getElementById('nt-cust-surface').value,
							text: document.getElementById('nt-cust-text').value,
							radius: Number(document.getElementById('nt-cust-radius').value || 12),
						};
						localStorage.setItem('nt:custom', JSON.stringify(vals));
						applyCustom(vals);
					};
					panel.querySelector('#nt-cust-reset').onclick = () => {
						localStorage.removeItem('nt:custom');
						applyCustom({});
					};
				}
				panel.classList.add('open');
			};
		}

		// Online/offline status
		const status = document.getElementById("nt-status");
		if (status) {
			const set = () => {
				status.style.background = navigator.onLine ? "#00d084" : "#ff4757";
				status.style.boxShadow = navigator.onLine ? "0 0 0 2px rgba(0,208,132,0.25)" : "0 0 0 2px rgba(255,71,87,0.25)";
			};
			set();
			window.addEventListener("online", set);
			window.addEventListener("offline", set);
		}

		// Removed keyboard density toggle
	}

	function init() {
		createContainer();
		hideDefaultUI();
		buildNav();
		// Try to pull user's preferred dashboard from User doctype custom field(s)
		loadUserDashboardPreference();
		maybeRedirectToPreferredDashboard();
		buildUserWidget();
		placeContentPortal();

		refreshUser();
		// Restore persisted density/width/theme
		const d = localStorage.getItem('nt:density');
		if (d === 'compact') document.body.classList.add('nt-density-compact');
		if (d === 'touch') document.body.classList.add('nt-density-touch');
		const w = localStorage.getItem('nt:width');
		if (w === 'wide') document.body.classList.add('nt-width-wide');
		if (w === 'medium') document.body.classList.add('nt-width-medium');
		if (w === 'narrow') document.body.classList.add('nt-width-narrow');
		// Apply persisted collapsed state and filters visibility
		const collapsed = localStorage.getItem("nt:sidebar-collapsed") === "1";
		const sidebar = document.querySelector(".nt-sidebar");
		const main = document.querySelector(".nt-main");
		if (collapsed && sidebar && main) {
			sidebar.classList.add("nt-collapsed");
			main.classList.add("nt-sidebar-collapsed");
		}
		if (localStorage.getItem("nt:hide-filters") === "1") {
			document.body.classList.add("nt-hide-list-sidebar");
		}
		// Force default left sidebar always
		const root = document.getElementById("nt-root");
		if (root) root.setAttribute("data-layout", "left sidebar");
	}

	const run = () => requestAnimationFrame(init);
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run, { once: true });
	} else {
		run();
	}

	// re-apply on route changes and page rebuilds
	document.addEventListener("page-change", () => {
		run();
		maybeRedirectToPreferredDashboard();
		// Check dashboard content after page change
		setTimeout(ensureDashboardContent, 200);
		// add to recents
		const route = (window.frappe?.router?.current_route || []).join('/');
		const label = document.title || route || 'Route';
		const item = { label, route };
		let arr = JSON.parse(localStorage.getItem('nt:recents') || '[]');
		arr = [item, ...arr.filter((i) => i.route !== item.route)].slice(0, 24);
		localStorage.setItem('nt:recents', JSON.stringify(arr));
		buildRecents();
		// Inject Workspace List toolbar when on List/Workspace
		try { injectWorkspaceListTools(); } catch (e) {}
	});

// If preferred dashboard changes during session, re-check redirect on next tick
try { document.addEventListener('nt:preferred-dashboard-updated', () => setTimeout(maybeRedirectToPreferredDashboard, 0)); } catch (e) {}

// Ensure dashboard view loads the correct dashboard content
function ensureDashboardContent() {
	try {
		const route = window.frappe?.router?.current_route || [];
		if (route[0] === 'dashboard-view' && route[1]) {
			const dashboardDocName = route[1];
			const preferred = getPreferredLabel();
			const expectedDocName = getDashboardDocumentName(preferred);
			
			// If we're on a dashboard view but it's not the preferred one, redirect
			if (preferred && dashboardDocName !== expectedDocName) {
				console.log('Redirecting to preferred dashboard:', preferred, '->', expectedDocName);
				window.frappe?.router?.set_route('dashboard-view', expectedDocName);
				return;
			}
			
			// Check if the dashboard content is actually showing the right dashboard
			const pageTitle = document.querySelector('.page-title, .page-head .page-title, h1');
			if (pageTitle && !pageTitle.textContent.toLowerCase().includes(preferred.toLowerCase())) {
				console.log('Dashboard content mismatch, reloading...');
				// Force reload the dashboard view
				setTimeout(() => {
					window.frappe?.router?.set_route('dashboard-view', expectedDocName);
				}, 100);
			}
		}
	} catch (e) {
		console.warn('Dashboard content check failed:', e);
	}
}

	// Apply custom overrides from localStorage after boot/apply
	function applyCustom(vals) {
		if (!vals) return;
		if (vals.bg) document.documentElement.style.setProperty('--nt-bg', vals.bg);
		if (vals.surface) document.documentElement.style.setProperty('--nt-surface', vals.surface);
		if (vals.text) document.documentElement.style.setProperty('--nt-text', vals.text);
		if (vals.primary) document.documentElement.style.setProperty('--nt-primary', vals.primary);
		if (vals.accent) document.documentElement.style.setProperty('--nt-accent', vals.accent);
		if (typeof vals.radius === 'number' && !Number.isNaN(vals.radius)) {
			document.documentElement.style.setProperty('--nt-radius-sm', vals.radius + 'px');
			document.documentElement.style.setProperty('--nt-radius-md', (vals.radius + 4) + 'px');
			document.documentElement.style.setProperty('--nt-radius-lg', (vals.radius + 8) + 'px');
		}
	}

	(function applyCustomFromStorage() {
		try {
			const preset = localStorage.getItem('nt:preset');
			if (preset) {
				// apply preset first
				const btn = document.getElementById('nt-theme-presets-btn');
				// call the same logic via helper
				const applySavedPreset = (p) => {
					const evt = new Event('click');
					// simulate by directly calling apply function if available
				};
				// re-implement minimal preset apply here to avoid scope issues
				const map = {
					dark: { bg:'#0f1115', surface:'#151922', surface2:'#1b2130', text:'#e6e8ed', textDim:'#b7bdd0', primary:'#7c5cff', onPrimary: contrastOn('#7c5cff'), accent:'#22d3ee', border:'rgba(255,255,255,0.06)' },
					light: { bg:'#f6f7fb', surface:'#ffffff', surface2:'#f5f7fb', text:'#0f1115', textDim:'#4b5563', primary:'#3066fb', onPrimary: contrastOn('#3066fb'), accent:'#0ea5e9', border:'rgba(0,0,0,0.08)' },
					amoled: { bg:'#000000', surface:'#0b0b0b', surface2:'#111111', text:'#eaeaea', textDim:'#b3b3b3', primary:'#22d3ee', onPrimary: contrastOn('#22d3ee'), accent:'#7c5cff', border:'rgba(255,255,255,0.08)' },
					ocean: { bg:'#0b1020', surface:'#121a2d', surface2:'#0f172a', text:'#dfe8ff', textDim:'#9fb4ff', primary:'#2dd4bf', onPrimary: contrastOn('#2dd4bf'), accent:'#22d3ee', border:'rgba(255,255,255,0.08)' },
					forest: { bg:'#0e1411', surface:'#152019', surface2:'#0f1a13', text:'#d7fbe8', textDim:'#a7e8cc', primary:'#22c55e', onPrimary: contrastOn('#22c55e'), accent:'#16a34a', border:'rgba(255,255,255,0.06)' },
					sunset: { bg:'#1a0f14', surface:'#22151b', surface2:'#2a1921', text:'#ffe4e6', textDim:'#fecdd3', primary:'#fb7185', onPrimary: contrastOn('#fb7185'), accent:'#f59e0b', border:'rgba(255,255,255,0.06)' },
					rose: { bg:'#141013', surface:'#1b1519', surface2:'#231a20', text:'#fce7f3', textDim:'#f5c2e7', primary:'#f472b6', onPrimary: contrastOn('#f472b6'), accent:'#fb7185', border:'rgba(255,255,255,0.06)' }
				};
				if (map[preset]) setRootVars(map[preset]);
			}
			const saved = JSON.parse(localStorage.getItem('nt:custom') || '{}');
			applyCustom(saved);
		} catch (e) {}
	})();
	const mo = new MutationObserver(() => placeContentPortal());
	mo.observe(document.body, { childList: true, subtree: true });

	function injectWorkspaceListTools(retryCount = 0) {
		const r = (window.frappe?.router?.current_route || []);
		if (!(r[0] === 'List' && r[1] === 'Workspace')) return;
		const page = document.querySelector('.page-head .page-actions, .page-head .actions, .page-actions');
		if (!page) {
			if (retryCount < 15) setTimeout(() => injectWorkspaceListTools(retryCount + 1), 150);
			return;
		}
		if (document.getElementById('nt-ws-list-tools')) return;
		const wrap = document.createElement('div');
		wrap.id = 'nt-ws-list-tools';
		wrap.innerHTML = `
			<button class="nt-btn" id="nt-ws-list-new">New Workspace</button>
		`;
		page.prepend(wrap);
		const btn = document.getElementById('nt-ws-list-new');
		if (btn) btn.onclick = () => { try { frappe.new_doc('Workspace'); } catch (e) { frappe.set_route('Form','Workspace','new-workspace'); } };
	}
})();

