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

	// Ensure proper viewport meta tag for mobile
	function ensureViewportMeta() {
		let viewport = document.querySelector('meta[name="viewport"]');
		if (!viewport) {
			viewport = document.createElement('meta');
			viewport.name = 'viewport';
			document.head.appendChild(viewport);
		}
		viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
	}

const MOBILE_MAX_WIDTH = 768;
const mobileMediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
let mobileLayoutActive = false;
let mobileMenuInitialized = false;

function initMobileLayout() {
	if (!mobileMediaQuery.matches) {
		teardownMobileLayout();
		return;
	}
	if (mobileLayoutActive) {
		// already initialized, nothing extra to do
		return;
	}
	mobileLayoutActive = true;
	document.body.classList.add('nt-mobile-ready');
	createMobileHeader();
	createMobileNavigation();
	initMobileMenu();
	optimizeMobileContent();
	testMobileLayout();
}

function teardownMobileLayout() {
	if (!mobileLayoutActive) return;
	mobileLayoutActive = false;
	document.body.classList.remove('nt-mobile-ready');
	const nav = document.querySelector('.nt-mobile-nav');
	const overlay = document.getElementById('nt-mobile-nav-overlay');
	const menuBtn = document.getElementById('nt-mobile-menu-btn');
	nav && nav.classList.remove('open');
	overlay && overlay.classList.remove('active');
	if (menuBtn) {
		menuBtn.classList.remove('active');
		menuBtn.classList.remove('open');
	}
	document.body.style.overflow = '';
}
	
	// Create mobile header
	function createMobileHeader() {
	let header = document.querySelector('.nt-mobile-header');
	if (header) return header;
	header = document.createElement('div');
	header.className = 'nt-mobile-header';
	header.innerHTML = `
				<div class="nt-mobile-menu-btn" id="nt-mobile-menu-btn">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div class="nt-mobile-title">Frappe</div>
				<div class="nt-mobile-search">
					<input type="text" placeholder="Search..." class="nt-input" id="nt-mobile-search">
				</div>
				<div class="nt-mobile-actions">
					<button class="nt-btn" id="nt-mobile-add" title="Add New">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
						</svg>
					</button>
					<button class="nt-btn" id="nt-mobile-notify" title="Notifications">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
						</svg>
					</button>
				</div>
			`;
			header.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				height: 60px;
				background: #fff;
				border-bottom: 1px solid #e1e5e9;
				z-index: 1000;
				display: flex;
				align-items: center;
				padding: 0 16px;
				box-shadow: 0 2px 8px rgba(0,0,0,0.1);
			`;
	document.body.insertBefore(header, document.body.firstChild);
	return header;
	}
	
	// Create mobile navigation
	function createMobileNavigation() {
	let nav = document.querySelector('.nt-mobile-nav');
	if (nav) return nav;
	nav = document.createElement('div');
	nav.className = 'nt-mobile-nav';
	nav.innerHTML = `
				<div class="nt-mobile-nav-overlay" id="nt-mobile-nav-overlay"></div>
				<div class="nt-mobile-nav-content">
					<div class="nt-mobile-nav-header">
						<h3>Menu</h3>
						<button class="nt-mobile-nav-close" id="nt-mobile-nav-close">×</button>
					</div>
					<div class="nt-mobile-nav-items">
						<a href="#" class="nt-mobile-nav-item" data-section="dashboard">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
							</svg>
							<span>Dashboard</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="sales">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h4c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h4zm2-2v2h6V2H9z"/>
							</svg>
							<span>Sales</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="purchase">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h4c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h4zm2-2v2h6V2H9z"/>
							</svg>
							<span>Purchase</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="inventory">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
							</svg>
							<span>Inventory</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="accounts">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
							</svg>
							<span>Accounts</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="hr">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5V22h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5c0-.83.67-1.5 1.5-1.5S12 8.67 12 9.5V15h2.5v-5.5c0-1.1.9-2 2-2s2 .9 2 2V22h-2v-6h-2v6H7.5z"/>
							</svg>
							<span>HR</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="manufacturing">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
							</svg>
							<span>Manufacturing</span>
						</a>
						<a href="#" class="nt-mobile-nav-item" data-section="settings">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
							</svg>
							<span>Settings</span>
						</a>
					</div>
				</div>
			`;
	document.body.appendChild(nav);
	return nav;
	}
	
	// Optimize mobile content
	function optimizeMobileContent() {
		// Add mobile padding to content
		const content = document.querySelector('.nt-content, .page-container');
		if (content) {
			content.style.paddingTop = '60px';
			content.style.paddingLeft = '16px';
			content.style.paddingRight = '16px';
			content.style.paddingBottom = '16px';
		}
		
		// Make all cards mobile-friendly
		const cards = document.querySelectorAll('.frappe-card, .widget, .nt-card, .form-dashboard-section');
		cards.forEach(card => {
			card.style.width = '100%';
			card.style.margin = '0 0 16px 0';
			card.style.padding = '20px';
			card.style.background = '#fff';
			card.style.borderRadius = '12px';
			card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
			card.style.border = '1px solid #e1e5e9';
			card.style.boxSizing = 'border-box';
		});
		
		// Make buttons mobile-friendly
		const buttons = document.querySelectorAll('.btn, .nt-btn');
		buttons.forEach(btn => {
			btn.style.width = '100%';
			btn.style.height = '48px';
			btn.style.padding = '12px 24px';
			btn.style.fontSize = '16px';
			btn.style.fontWeight = '600';
			btn.style.borderRadius = '8px';
			btn.style.marginBottom = '12px';
			btn.style.display = 'flex';
			btn.style.alignItems = 'center';
			btn.style.justifyContent = 'center';
			btn.style.boxSizing = 'border-box';
			btn.style.transition = 'all 0.2s';
		});
		
		// Make forms mobile-friendly
		const inputs = document.querySelectorAll('.form-control, .control-input, .nt-input, .frappe-control input, .frappe-control textarea');
		inputs.forEach(input => {
			input.style.width = '100%';
			input.style.height = '48px';
			input.style.padding = '12px 16px';
			input.style.fontSize = '16px';
			input.style.border = '1px solid #e1e5e9';
			input.style.borderRadius = '8px';
			input.style.marginBottom = '16px';
			input.style.boxSizing = 'border-box';
			input.style.background = '#fff';
		});
	}
	
	// Test mobile layout
	function testMobileLayout() {
	if (!mobileLayoutActive) return;
	const testResults = {
		header: !!document.querySelector('.nt-mobile-header'),
		navigation: !!document.querySelector('.nt-mobile-nav'),
		content: !!document.querySelector('.nt-content, .page-container'),
		layout: document.body.classList.contains('nt-mobile-ready'),
	};
	showMobileTestIndicator(testResults);
	}
	
	// Show mobile test indicator
	function showMobileTestIndicator(results) {
		// Remove existing indicator
		const existingIndicator = document.querySelector('.nt-mobile-test-indicator');
		if (existingIndicator) {
			existingIndicator.remove();
		}
		
		// Calculate success rate
	const totalTests = 4;
	const passedTests =
		(results.header ? 1 : 0) +
		(results.navigation ? 1 : 0) +
		(results.content ? 1 : 0) +
		(results.layout ? 1 : 0);
		const successRate = Math.round((passedTests / totalTests) * 100);
		
		// Create indicator
		const indicator = document.createElement('div');
		indicator.className = 'nt-mobile-test-indicator';
		indicator.innerHTML = `📱 Mobile Test: ${successRate}% Passed`;
		indicator.style.background = successRate >= 80 ? '#28a745' : successRate >= 60 ? '#ffc107' : '#dc3545';
		
		document.body.appendChild(indicator);
		
		// Auto remove after 5 seconds
		setTimeout(() => {
			if (indicator && indicator.parentNode) {
				indicator.remove();
			}
		}, 5000);
		
		// Show debug info on click
		indicator.addEventListener('click', () => {
			showMobileDebugInfo(results);
		});
	}
	
	// Show mobile debug info
	function showMobileDebugInfo(results) {
		// Remove existing debug info
		const existingDebug = document.querySelector('.nt-mobile-debug');
		if (existingDebug) {
			existingDebug.remove();
			return;
		}
		
		// Create debug info
		const debug = document.createElement('div');
		debug.className = 'nt-mobile-debug show';
		debug.innerHTML = `
			<div style="margin-bottom: 8px; font-weight: bold;">📱 Mobile Layout Debug</div>
			<div>Mobile Header: ${results.header ? '✅' : '❌'}</div>
			<div>Mobile Navigation: ${results.navigation ? '✅' : '❌'}</div>
			<div>Content Full Width: ${results.content ? '✅' : '❌'}</div>
			<div>Single Column Layout: ${results.layout ? '✅' : '❌'}</div>
			<div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">Click to close</div>
		`;
		
		document.body.appendChild(debug);
		
		// Close on click
		debug.addEventListener('click', () => {
			debug.remove();
		});
	}

// Mobile menu functionality
function initMobileMenu() {
	if (mobileMenuInitialized) return;
	const navWrapper = document.querySelector('.nt-mobile-nav');
	const menuBtn = document.getElementById('nt-mobile-menu-btn');
	const overlay = document.getElementById('nt-mobile-nav-overlay');
	const closeBtn = document.getElementById('nt-mobile-nav-close');
	if (!navWrapper || !menuBtn || !overlay) return;

	const navItems = navWrapper.querySelector('.nt-mobile-nav-items');
	const openNav = () => {
		navWrapper.classList.add('open');
		overlay.classList.add('active');
		document.body.style.overflow = 'hidden';
		menuBtn.classList.add('active');
	};
	const closeNav = () => {
		navWrapper.classList.remove('open');
		overlay.classList.remove('active');
		document.body.style.overflow = '';
		menuBtn.classList.remove('active');
	};

	menuBtn.addEventListener('click', () => {
		if (navWrapper.classList.contains('open')) closeNav();
		else openNav();
	});
	overlay.addEventListener('click', closeNav);
	closeBtn?.addEventListener('click', closeNav);
	if (navItems) {
		navItems.addEventListener('click', (event) => {
			const link = event.target.closest('a');
			if (link) closeNav();
		});
	}
	window.addEventListener('resize', () => {
		if (!mobileMediaQuery.matches) closeNav();
	});
	window.addEventListener('orientationchange', () => {
		setTimeout(() => {
			if (!mobileMediaQuery.matches) closeNav();
		}, 150);
	});
	mobileMenuInitialized = true;
}

	ready(() => {
		applyThemeVars(getBootSettings());
		// If a legacy route briefly triggered a Not Found modal, close it silently
		setTimeout(closeNotFoundDialog, 0);
		// Re-apply on desk refresh (route changes)
		document.addEventListener("page-change", () => {
			applyThemeVars(getBootSettings());
			if (mobileMediaQuery.matches) {
				initMobileLayout();
				testMobileLayout();
			}
		});
		// Enforce default density on load
		document.body.classList.remove('nt-density-compact', 'nt-density-touch');
		try { localStorage.removeItem('nt:density'); } catch (e) {}
		
		// Initialize mobile layout
		initMobileLayout();
		
		// Initialize mobile menu functionality
		initMobileMenu();
		
		// Test mobile layout
		testMobileLayout();
		
		// Ensure proper viewport meta tag for mobile
		ensureViewportMeta();

		const handleMobileChange = (e) => {
			if (e.matches) {
				initMobileLayout();
				testMobileLayout();
			} else {
				teardownMobileLayout();
			}
		};
		handleMobileChange(mobileMediaQuery);
		if (typeof mobileMediaQuery.addEventListener === 'function') {
			mobileMediaQuery.addEventListener('change', handleMobileChange);
		} else if (typeof mobileMediaQuery.addListener === 'function') {
			mobileMediaQuery.addListener(handleMobileChange);
		}

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
				const defaultDash = null;
				setTimeout(() => { closeNotFoundDialog(); }, 0);
			}
			// 3) legacy server routes like /dash/<Role> or /app/dash/<Role> -> client hash router
			let m = p.match(/^\/dash\/(.+)$/) || p.match(/^\/app\/dash\/(.+)$/);
			if (m && m[1]) {
				const role = decodeURIComponent(m[1]);
				location.replace('/app#dash/' + encodeURIComponent(role));
				setTimeout(() => { closeNotFoundDialog(); }, 0);
			}
		} catch (e) {}
	});
})();
