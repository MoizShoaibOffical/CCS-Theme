/**
 * Advanced Features for New Theme
 * Includes: Quick Actions, Keyboard Shortcuts, Activity Feed, Enhanced Search, etc.
 */

(function() {
	'use strict';

	// ===========================================
	// QUICK ACTIONS PANEL
	// ===========================================
	function initQuickActionsPanel() {
		const fab = document.createElement('button');
		fab.className = 'nt-fab';
		fab.id = 'nt-quick-actions-fab';
		fab.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
		fab.setAttribute('aria-label', 'Quick Actions');
		document.body.appendChild(fab);

		const panel = document.createElement('div');
		panel.id = 'nt-quick-actions-panel';
		panel.className = 'nt-quick-actions-panel';
		panel.innerHTML = `
			<div class="nt-qa-header">
				<h3>Quick Actions</h3>
				<button class="nt-qa-close" aria-label="Close">✕</button>
			</div>
			<div class="nt-qa-body">
				<div class="nt-qa-grid" id="nt-qa-grid"></div>
			</div>
		`;
		document.body.appendChild(panel);

		const quickActions = [
			{ icon: '📄', label: 'New Document', action: () => showQuickCreate() },
			{ icon: '🔍', label: 'Search', action: () => focusSearch() },
			{ icon: '📊', label: 'Dashboard', action: () => navigateToDashboard() },
			{ icon: '👤', label: 'Profile', action: () => navigateToProfile() },
			{ icon: '⚙️', label: 'Settings', action: () => navigateToSettings() },
			{ icon: '📝', label: 'Notes', action: () => createNote() },
			{ icon: '📅', label: 'Calendar', action: () => navigateToCalendar() },
			{ icon: '💬', label: 'Chat', action: () => navigateToChat() },
		];

		const grid = document.getElementById('nt-qa-grid');
		quickActions.forEach(action => {
			const item = document.createElement('div');
			item.className = 'nt-qa-item';
			item.innerHTML = `
				<div class="nt-qa-icon">${action.icon}</div>
				<div class="nt-qa-label">${action.label}</div>
			`;
			item.onclick = action.action;
			grid.appendChild(item);
		});

		fab.onclick = () => panel.classList.toggle('nt-open');
		panel.querySelector('.nt-qa-close').onclick = () => panel.classList.remove('nt-open');
		document.addEventListener('click', (e) => {
			if (!panel.contains(e.target) && !fab.contains(e.target)) {
				panel.classList.remove('nt-open');
			}
		});
	}

	// ===========================================
	// KEYBOARD SHORTCUTS HELPER
	// ===========================================
	function initKeyboardShortcuts() {
		const shortcuts = [
			{ key: 'Ctrl/Cmd + K', description: 'Open search' },
			{ key: 'Ctrl/Cmd + N', description: 'New document' },
			{ key: 'Ctrl/Cmd + /', description: 'Show shortcuts' },
			{ key: 'Ctrl/Cmd + B', description: 'Toggle sidebar' },
			{ key: 'Esc', description: 'Close dialogs' },
			{ key: 'Ctrl/Cmd + S', description: 'Save document' },
			{ key: 'Ctrl/Cmd + P', description: 'Print' },
			{ key: 'Ctrl/Cmd + F', description: 'Find in page' },
		];

		// Show shortcuts panel
		document.addEventListener('keydown', (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === '/') {
				e.preventDefault();
				showShortcutsPanel(shortcuts);
			}
		});

		// Register shortcuts
		document.addEventListener('keydown', (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
				e.preventDefault();
				toggleSidebar();
			}
		});
	}

	function showShortcutsPanel(shortcuts) {
		let panel = document.getElementById('nt-shortcuts-panel');
		if (!panel) {
			panel = document.createElement('div');
			panel.id = 'nt-shortcuts-panel';
			panel.className = 'nt-shortcuts-panel';
			document.body.appendChild(panel);
		}

		panel.innerHTML = `
			<div class="nt-shortcuts-header">
				<h3>Keyboard Shortcuts</h3>
				<button class="nt-shortcuts-close" aria-label="Close">✕</button>
			</div>
			<div class="nt-shortcuts-body">
				${shortcuts.map(s => `
					<div class="nt-shortcut-item">
						<kbd class="nt-shortcut-key">${s.key}</kbd>
						<span class="nt-shortcut-desc">${s.description}</span>
					</div>
				`).join('')}
			</div>
		`;

		panel.classList.add('nt-open');
		panel.querySelector('.nt-shortcuts-close').onclick = () => panel.classList.remove('nt-open');
		document.addEventListener('click', (e) => {
			if (!panel.contains(e.target)) {
				panel.classList.remove('nt-open');
			}
		});
	}

	// ===========================================
	// ENHANCED SEARCH WITH SUGGESTIONS
	// ===========================================
	function initEnhancedSearch() {
		const searchInput = document.getElementById('nt-cmdk');
		if (!searchInput) return;

		const suggestionsPanel = document.createElement('div');
		suggestionsPanel.id = 'nt-search-suggestions';
		suggestionsPanel.className = 'nt-search-suggestions';
		searchInput.parentElement.appendChild(suggestionsPanel);

		let searchTimeout;
		searchInput.addEventListener('input', (e) => {
			clearTimeout(searchTimeout);
			const query = e.target.value.trim();
			
			if (query.length < 2) {
				suggestionsPanel.classList.remove('nt-open');
				return;
			}

			searchTimeout = setTimeout(() => {
				showSearchSuggestions(query, suggestionsPanel);
			}, 300);
		});

		searchInput.addEventListener('focus', () => {
			if (searchInput.value.trim().length >= 2) {
				suggestionsPanel.classList.add('nt-open');
			}
		});

		document.addEventListener('click', (e) => {
			if (!searchInput.contains(e.target) && !suggestionsPanel.contains(e.target)) {
				suggestionsPanel.classList.remove('nt-open');
			}
		});
	}

	function showSearchSuggestions(query, panel) {
		// Get recent items
		const recents = JSON.parse(localStorage.getItem('nt:recents') || '[]');
		const filtered = recents.filter(r => 
			r.label.toLowerCase().includes(query.toLowerCase()) ||
			r.route.toLowerCase().includes(query.toLowerCase())
		).slice(0, 5);

		// Get doctypes
		const doctypes = (window.frappe?.boot?.user?.all_doctypes || []).filter(dt =>
			dt.toLowerCase().includes(query.toLowerCase())
		).slice(0, 5);

		if (filtered.length === 0 && doctypes.length === 0) {
			panel.classList.remove('nt-open');
			return;
		}

		panel.innerHTML = `
			${filtered.length > 0 ? `
				<div class="nt-suggestions-section">
					<div class="nt-suggestions-title">Recent</div>
					${filtered.map(item => `
						<div class="nt-suggestion-item" data-route="${item.route}">
							<span class="nt-suggestion-icon">🕒</span>
							<span class="nt-suggestion-text">${item.label}</span>
						</div>
					`).join('')}
				</div>
			` : ''}
			${doctypes.length > 0 ? `
				<div class="nt-suggestions-section">
					<div class="nt-suggestions-title">Doctypes</div>
					${doctypes.map(dt => `
						<div class="nt-suggestion-item" data-doctype="${dt}">
							<span class="nt-suggestion-icon">📄</span>
							<span class="nt-suggestion-text">${dt}</span>
						</div>
					`).join('')}
				</div>
			` : ''}
		`;

		panel.classList.add('nt-open');

		// Handle clicks
		panel.querySelectorAll('.nt-suggestion-item').forEach(item => {
			item.onclick = () => {
				const route = item.getAttribute('data-route');
				const doctype = item.getAttribute('data-doctype');
				if (route) {
					window.frappe?.router?.set_route(...route.split('/'));
				} else if (doctype) {
					window.frappe?.router?.set_route('List', doctype);
				}
				panel.classList.remove('nt-open');
			};
		});
	}

	// ===========================================
	// ACTIVITY FEED
	// ===========================================
	function initActivityFeed() {
		const activityBtn = document.createElement('button');
		activityBtn.className = 'nt-btn';
		activityBtn.id = 'nt-activity-btn';
		activityBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>';
		activityBtn.title = 'Activity Feed';
		
		// Insert after notifications
		const notify = document.getElementById('nt-notify');
		if (notify && notify.parentElement) {
			notify.parentElement.insertBefore(activityBtn, notify.nextSibling);
		}

		const activityPanel = document.createElement('div');
		activityPanel.id = 'nt-activity-panel';
		activityPanel.className = 'nt-menu nt-menu-lg';
		activityPanel.innerHTML = `
			<div class="nt-activity-header">
				<h4>Recent Activity</h4>
			</div>
			<div class="nt-activity-body" id="nt-activity-body">
				<div class="nt-activity-loading">Loading...</div>
			</div>
		`;
		document.body.appendChild(activityPanel);

		activityBtn.onclick = () => {
			activityPanel.classList.toggle('nt-open');
			if (activityPanel.classList.contains('nt-open')) {
				loadActivityFeed();
			}
		};

		// Load activity feed
		function loadActivityFeed() {
			const body = document.getElementById('nt-activity-body');
			body.innerHTML = '<div class="nt-activity-loading">Loading...</div>';

			// Get recent routes
			const recents = JSON.parse(localStorage.getItem('nt:recents') || '[]').slice(0, 10);
			
			if (recents.length === 0) {
				body.innerHTML = '<div class="nt-activity-empty">No recent activity</div>';
				return;
			}

			body.innerHTML = recents.map(item => `
				<div class="nt-activity-item">
					<div class="nt-activity-icon">📄</div>
					<div class="nt-activity-content">
						<div class="nt-activity-title">${item.label}</div>
						<div class="nt-activity-time">Recently visited</div>
					</div>
					<button class="nt-activity-action" data-route="${item.route}">→</button>
				</div>
			`).join('');

			body.querySelectorAll('.nt-activity-action').forEach(btn => {
				btn.onclick = () => {
					const route = btn.getAttribute('data-route');
					if (route) {
						window.frappe?.router?.set_route(...route.split('/'));
						activityPanel.classList.remove('nt-open');
					}
				};
			});
		}
	}

	// ===========================================
	// DASHBOARD WIDGETS
	// ===========================================
	function initDashboardWidgets() {
		// This will be injected into dashboard pages
		if (!window.frappe?.router?.current_route) return;
		const route = window.frappe.router.current_route || [];
		if (route[0] !== 'workspace' && route[0] !== 'dashboard-view') return;

		// Check if already initialized
		if (document.getElementById('nt-dashboard-widgets')) return;

		// Add widget container
		const widgetContainer = document.createElement('div');
		widgetContainer.id = 'nt-dashboard-widgets';
		widgetContainer.className = 'nt-dashboard-widgets';
		
		// Wait for page to load
		setTimeout(() => {
			const content = document.getElementById('nt-content') || document.querySelector('.page-container') || document.querySelector('.layout-main-section');
			if (content && !document.getElementById('nt-dashboard-widgets')) {
				content.insertBefore(widgetContainer, content.firstChild);
				renderDashboardWidgets(widgetContainer);
			}
		}, 1000);
	}

	function renderDashboardWidgets(container) {
		// Quick Stats Widget
		const statsWidget = document.createElement('div');
		statsWidget.className = 'nt-widget nt-widget-stats';
		statsWidget.innerHTML = `
			<div class="nt-widget-header">
				<h4>📊 Quick Stats</h4>
			</div>
			<div class="nt-widget-body">
				<div class="nt-stat-item">
					<div class="nt-stat-value" id="nt-stat-docs">-</div>
					<div class="nt-stat-label">Documents Today</div>
				</div>
				<div class="nt-stat-item">
					<div class="nt-stat-value" id="nt-stat-users">-</div>
					<div class="nt-stat-label">Active Users</div>
				</div>
				<div class="nt-stat-item">
					<div class="nt-stat-value" id="nt-stat-tasks">-</div>
					<div class="nt-stat-label">Pending Tasks</div>
				</div>
				<div class="nt-stat-item">
					<div class="nt-stat-value" id="nt-stat-notifications">-</div>
					<div class="nt-stat-label">Notifications</div>
				</div>
			</div>
		`;
		container.appendChild(statsWidget);

		// Recent Activity Widget
		const activityWidget = document.createElement('div');
		activityWidget.className = 'nt-widget nt-widget-activity';
		activityWidget.innerHTML = `
			<div class="nt-widget-header">
				<h4>🕒 Recent Activity</h4>
			</div>
			<div class="nt-widget-body" id="nt-widget-activity-body">
				<div class="nt-widget-loading">Loading...</div>
			</div>
		`;
		container.appendChild(activityWidget);

		// Quick Links Widget
		const linksWidget = document.createElement('div');
		linksWidget.className = 'nt-widget nt-widget-links';
		linksWidget.innerHTML = `
			<div class="nt-widget-header">
				<h4>🔗 Quick Links</h4>
			</div>
			<div class="nt-widget-body">
				<div class="nt-links-grid" id="nt-links-grid"></div>
			</div>
		`;
		container.appendChild(linksWidget);

		// Load all widgets
		loadQuickStats();
		loadRecentActivity();
		loadQuickLinks();
	}

	function loadQuickStats() {
		// Get user info
		const user = window.frappe?.boot?.user;
		const allDoctypes = user?.all_doctypes || [];
		
		// Calculate stats
		const docCount = allDoctypes.length;
		const userCount = 1; // Current user
		const taskCount = 0; // Can be connected to ToDo API
		const notificationCount = 0; // Can be connected to notifications API

		// Update UI
		const docsEl = document.getElementById('nt-stat-docs');
		const usersEl = document.getElementById('nt-stat-users');
		const tasksEl = document.getElementById('nt-stat-tasks');
		const notifEl = document.getElementById('nt-stat-notifications');

		if (docsEl) {
			animateValue(docsEl, 0, docCount, 1000);
		}
		if (usersEl) {
			animateValue(usersEl, 0, userCount, 1000);
		}
		if (tasksEl) {
			animateValue(tasksEl, 0, taskCount, 1000);
		}
		if (notifEl) {
			animateValue(notifEl, 0, notificationCount, 1000);
		}
	}

	function animateValue(element, start, end, duration) {
		let startTimestamp = null;
		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			const value = Math.floor(progress * (end - start) + start);
			element.textContent = value;
			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		};
		window.requestAnimationFrame(step);
	}

	function loadRecentActivity() {
		const body = document.getElementById('nt-widget-activity-body');
		if (!body) return;

		const recents = JSON.parse(localStorage.getItem('nt:recents') || '[]').slice(0, 5);
		
		if (recents.length === 0) {
			body.innerHTML = '<div class="nt-widget-empty">No recent activity</div>';
			return;
		}

		body.innerHTML = recents.map((item, index) => `
			<div class="nt-activity-widget-item" style="animation-delay: ${index * 0.1}s">
				<div class="nt-activity-widget-icon">📄</div>
				<div class="nt-activity-widget-content">
					<div class="nt-activity-widget-title">${item.label}</div>
					<div class="nt-activity-widget-time">Recently visited</div>
				</div>
				<button class="nt-activity-widget-action" data-route="${item.route}" title="Open">→</button>
			</div>
		`).join('');

		body.querySelectorAll('.nt-activity-widget-action').forEach(btn => {
			btn.onclick = () => {
				const route = btn.getAttribute('data-route');
				if (route && window.frappe?.router) {
					window.frappe.router.set_route(...route.split('/'));
				}
			};
		});
	}

	function loadQuickLinks() {
		const grid = document.getElementById('nt-links-grid');
		if (!grid) return;

		const quickLinks = [
			{ icon: '📄', label: 'New Doc', route: () => showQuickCreate() },
			{ icon: '📊', label: 'Reports', route: () => window.frappe?.router?.set_route('List', 'Report') },
			{ icon: '👥', label: 'Users', route: () => window.frappe?.router?.set_route('List', 'User') },
			{ icon: '⚙️', label: 'Settings', route: () => window.frappe?.router?.set_route('Form', 'System Settings') },
		];

		grid.innerHTML = quickLinks.map(link => `
			<div class="nt-link-item" onclick="${link.route.toString().replace(/"/g, '&quot;')}">
				<div class="nt-link-icon">${link.icon}</div>
				<div class="nt-link-label">${link.label}</div>
			</div>
		`).join('');

		// Fix onclick handlers
		grid.querySelectorAll('.nt-link-item').forEach((item, index) => {
			item.onclick = quickLinks[index].route;
		});
	}

	// ===========================================
	// HELPER FUNCTIONS
	// ===========================================
	function showQuickCreate() {
		const addNewBtn = document.getElementById('nt-addnew-btn');
		if (addNewBtn) addNewBtn.click();
	}

	function focusSearch() {
		const search = document.getElementById('nt-cmdk');
		if (search) search.focus();
	}

	function navigateToDashboard() {
		window.frappe?.router?.set_route('workspace');
	}

	function navigateToProfile() {
		const user = window.frappe?.session?.user || window.frappe?.boot?.user?.name;
		if (user) {
			window.frappe?.router?.set_route('Form', 'User', user);
		}
	}

	function navigateToSettings() {
		window.frappe?.router?.set_route('Form', 'System Settings');
	}

	function createNote() {
		window.frappe?.router?.set_route('Form', 'Note', 'new-note-1');
	}

	function navigateToCalendar() {
		window.frappe?.router?.set_route('calendar');
	}

	function navigateToChat() {
		window.frappe?.router?.set_route('chat');
	}

	function toggleSidebar() {
		const sidebar = document.querySelector('.nt-sidebar');
		const main = document.querySelector('.nt-main');
		if (sidebar && main) {
			sidebar.classList.toggle('nt-collapsed');
			main.classList.toggle('nt-sidebar-collapsed');
		}
	}

	// ===========================================
	// INITIALIZATION
	// ===========================================
	function init() {
		// Wait for DOM
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', init);
			return;
		}

		// Initialize features
		setTimeout(() => {
			initQuickActionsPanel();
			initKeyboardShortcuts();
			initEnhancedSearch();
			initActivityFeed();
			initDashboardWidgets();
		}, 1000);

		// Re-initialize on route changes
		document.addEventListener('page-change', () => {
			setTimeout(() => {
				initDashboardWidgets();
			}, 500);
		});
	}

	init();
})();

