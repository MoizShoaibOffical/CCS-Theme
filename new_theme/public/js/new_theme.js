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

// NUCLEAR MOBILE FIX - ULTIMATE APPROACH
function initMobileLayout() {
    if (window.innerWidth <= 768) {
        console.log('🚀 NUCLEAR MOBILE FIX STARTED');
        
        // NUCLEAR: Hide ALL possible sidebar elements
        const sidebarSelectors = [
            '*[class*="sidebar"]', '*[id*="sidebar"]', '.nt-sidebar', '.standard-sidebar', 
            '.desk-sidebar', '.sidebar-section', '.layout-side-section', '.sidebar',
            '.sidebar-container', '.sidebar-wrapper', '[class*="sidebar"]', 'div[class*="sidebar"]'
        ];
        
        sidebarSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Apply nuclear CSS
                    element.style.cssText = `
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        width: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                        position: fixed !important;
                        left: -9999px !important;
                        top: -9999px !important;
                        z-index: -9999 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        transform: translateX(-100%) !important;
                    `;
                });
            } catch (e) {
                console.log('Error hiding sidebar:', e);
            }
        });
        
        // Force hide any remaining sidebars
        setTimeout(() => {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                const className = element.className || '';
                const id = element.id || '';
                if (className.includes('sidebar') || id.includes('sidebar')) {
                    element.style.cssText = `
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        width: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                        position: fixed !important;
                        left: -9999px !important;
                        top: -9999px !important;
                        z-index: -9999 !important;
                    `;
                }
            });
        }, 100);
        
        // Create mobile header
        createMobileHeader();
        
        // Create mobile navigation
        createMobileNavigation();
        
        // Optimize mobile content
        optimizeMobileContent();
        
        // Apply mobile UI improvements
        improveMobileUI();
        
        console.log('✅ NUCLEAR MOBILE FIX COMPLETED');
    }
}
	
	// Create mobile header
	function createMobileHeader() {
		if (!document.querySelector('.nt-mobile-header')) {
			const header = document.createElement('div');
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
		}
	}
	
	// Create mobile navigation
	function createMobileNavigation() {
		if (!document.querySelector('.nt-mobile-nav')) {
			const nav = document.createElement('div');
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
			nav.style.cssText = `
				position: fixed;
				top: 0;
				left: -280px;
				width: 280px;
				height: 100vh;
				background: #fff;
				z-index: 1001;
				transition: left 0.3s ease;
				box-shadow: 2px 0 10px rgba(0,0,0,0.15);
			`;
			document.body.appendChild(nav);
			
			// Add navigation functionality
			const menuBtn = document.getElementById('nt-mobile-menu-btn');
			const navOverlay = document.getElementById('nt-mobile-nav-overlay');
			const navClose = document.getElementById('nt-mobile-nav-close');
			
			if (menuBtn) {
				menuBtn.addEventListener('click', () => {
					nav.style.left = '0';
					navOverlay.style.display = 'block';
				});
			}
			
			if (navOverlay) {
				navOverlay.addEventListener('click', () => {
					nav.style.left = '-280px';
					navOverlay.style.display = 'none';
				});
			}
			
			if (navClose) {
				navClose.addEventListener('click', () => {
					nav.style.left = '-280px';
					navOverlay.style.display = 'none';
				});
			}
		}
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
		if (window.innerWidth <= 768) {
			console.log('📱 Mobile Layout Test Started');
			
			let testResults = {
				sidebars: 0,
				header: false,
				navigation: false,
				content: false,
				layout: false
			};
			
			// Test 1: Check if sidebars are hidden
			const sidebars = document.querySelectorAll('.nt-sidebar, .standard-sidebar, .desk-sidebar, .sidebar-section, .layout-side-section');
			sidebars.forEach(sidebar => {
				if (sidebar.style.display === 'none' || sidebar.style.visibility === 'hidden') {
					testResults.sidebars++;
				}
			});
			console.log(`✅ Sidebars hidden: ${testResults.sidebars}/${sidebars.length}`);
			
			// Test 2: Check if mobile header exists
			const mobileHeader = document.querySelector('.nt-mobile-header');
			if (mobileHeader) {
				testResults.header = true;
				console.log('✅ Mobile header created');
			} else {
				console.log('❌ Mobile header not found');
			}
			
			// Test 3: Check if mobile navigation exists
			const mobileNav = document.querySelector('.nt-mobile-nav');
			if (mobileNav) {
				testResults.navigation = true;
				console.log('✅ Mobile navigation created');
			} else {
				console.log('❌ Mobile navigation not found');
			}
			
			// Test 4: Check if content is full width
			const content = document.querySelector('.nt-content, .page-container');
			if (content && (content.style.width === '100%' || content.offsetWidth >= window.innerWidth * 0.9)) {
				testResults.content = true;
				console.log('✅ Content is full width');
			} else {
				console.log('❌ Content width issue');
			}
			
			// Test 5: Check if main layout is single column
			const main = document.querySelector('.nt-main, .desk-container .nt-main');
			if (main && (main.style.gridTemplateColumns === '1fr' || main.offsetWidth >= window.innerWidth * 0.9)) {
				testResults.layout = true;
				console.log('✅ Main layout is single column');
			} else {
				console.log('❌ Main layout issue');
			}
			
			// Show visual test indicator
			showMobileTestIndicator(testResults);
			
			console.log('📱 Mobile Layout Test Completed');
		}
	}
	
	// Show mobile test indicator
	function showMobileTestIndicator(results) {
		// Remove existing indicator
		const existingIndicator = document.querySelector('.nt-mobile-test-indicator');
		if (existingIndicator) {
			existingIndicator.remove();
		}
		
		// Calculate success rate
		const totalTests = 5;
		const passedTests = results.sidebars + (results.header ? 1 : 0) + (results.navigation ? 1 : 0) + (results.content ? 1 : 0) + (results.layout ? 1 : 0);
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
			<div>Sidebars Hidden: ${results.sidebars}</div>
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
		// Create mobile menu button
		const mobileMenuBtn = document.createElement('button');
		mobileMenuBtn.className = 'nt-mobile-menu-btn';
		mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
		document.body.appendChild(mobileMenuBtn);

		// Create mobile overlay
		const mobileOverlay = document.createElement('div');
		mobileOverlay.className = 'nt-mobile-overlay';
		document.body.appendChild(mobileOverlay);

		// Get sidebar element
		const sidebar = document.querySelector('.nt-sidebar');
		if (!sidebar) return;
		
		// Ensure sidebar is hidden by default on mobile
		if (window.innerWidth <= 768) {
			sidebar.classList.remove('mobile-open');
			sidebar.style.display = 'none';
			sidebar.style.transform = 'translateX(-100%)';
			sidebar.style.visibility = 'hidden';
			sidebar.style.opacity = '0';
		}

		// Toggle mobile menu
		function toggleMobileMenu() {
			const isOpen = sidebar.classList.contains('mobile-open');
			
			if (isOpen) {
				sidebar.classList.remove('mobile-open');
				sidebar.style.display = 'none';
				sidebar.style.transform = 'translateX(-100%)';
				sidebar.style.visibility = 'hidden';
				sidebar.style.opacity = '0';
				mobileOverlay.classList.remove('active');
				mobileMenuBtn.classList.remove('active');
				document.body.style.overflow = '';
			} else {
				sidebar.classList.add('mobile-open');
				sidebar.style.display = 'block';
				sidebar.style.transform = 'translateX(0)';
				sidebar.style.visibility = 'visible';
				sidebar.style.opacity = '1';
				mobileOverlay.classList.add('active');
				mobileMenuBtn.classList.add('active');
				document.body.style.overflow = 'hidden';
			}
		}

		// Close mobile menu
		function closeMobileMenu() {
			sidebar.classList.remove('mobile-open');
			sidebar.style.display = 'none';
			sidebar.style.transform = 'translateX(-100%)';
			sidebar.style.visibility = 'hidden';
			sidebar.style.opacity = '0';
			mobileOverlay.classList.remove('active');
			mobileMenuBtn.classList.remove('active');
			document.body.style.overflow = '';
		}

		// Event listeners
		mobileMenuBtn.addEventListener('click', toggleMobileMenu);
		mobileOverlay.addEventListener('click', closeMobileMenu);

		// Close menu when clicking on sidebar links
		sidebar.addEventListener('click', (e) => {
			if (e.target.closest('a, button')) {
				setTimeout(closeMobileMenu, 100);
			}
		});

		// Close menu on escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
				closeMobileMenu();
			}
		});

		// Handle window resize
		window.addEventListener('resize', () => {
			if (window.innerWidth > 768) {
				closeMobileMenu();
			}
		});

		// Handle orientation change
		window.addEventListener('orientationchange', () => {
			setTimeout(() => {
				if (window.innerWidth > 768) {
					closeMobileMenu();
				}
			}, 100);
		});
	}

	// Force hide sidebar on mobile
	function forceHideSidebarOnMobile() {
		console.log('🔍 Checking mobile status:', window.innerWidth, '<= 768?', window.innerWidth <= 768);
		
		if (window.innerWidth <= 768) {
			console.log('📱 Mobile detected! Hiding sidebar...');
			
			// Hide all possible sidebar elements
			const sidebarSelectors = [
				'.nt-sidebar', '.standard-sidebar', '.desk-sidebar', 
				'.sidebar-section', '.layout-side-section', '.sidebar',
				'.sidebar-container', '.sidebar-wrapper', '.desk-sidebar',
				'[data-sidebar]', '.sidebar', '.layout-sidebar'
			];
			
			let hiddenCount = 0;
			sidebarSelectors.forEach(selector => {
				const elements = document.querySelectorAll(selector);
				elements.forEach(element => {
					element.style.display = 'none !important';
					element.style.visibility = 'hidden !important';
					element.style.opacity = '0 !important';
					element.style.transform = 'translateX(-100%) !important';
					element.style.width = '0 !important';
					element.style.minWidth = '0 !important';
					element.style.maxWidth = '0 !important';
					hiddenCount++;
				});
			});
			
			// Also hide by class patterns
			const allElements = document.querySelectorAll('*');
			allElements.forEach(element => {
				if (element.className && typeof element.className === 'string') {
					const className = element.className.toLowerCase();
					if (className.includes('sidebar') || className.includes('side-section')) {
						element.style.display = 'none !important';
						hiddenCount++;
					}
				}
			});
			
			console.log('✅ Hidden', hiddenCount, 'sidebar elements');
			
			// Make main content full width and visible
			const mainSelectors = ['.layout-main-section', '.main-section', '.content-area', '.layout-main', '.main-content', '.desk-container'];
			let mainCount = 0;
			mainSelectors.forEach(selector => {
				const elements = document.querySelectorAll(selector);
				elements.forEach(element => {
					element.style.width = '100%';
					element.style.maxWidth = '100%';
					element.style.marginLeft = '0';
					element.style.paddingLeft = '0';
					element.style.display = 'block';
					element.style.visibility = 'visible';
					element.style.opacity = '1';
					mainCount++;
					console.log('🔧 Fixed main content element:', selector, element);
				});
			});
			console.log('✅ Made', mainCount, 'main content elements full width and visible');
			
			// Debug: Check what's in the body
			console.log('🔍 Body children:', document.body.children.length);
			console.log('🔍 Main section found:', document.querySelector('.layout-main-section') ? 'YES' : 'NO');
			console.log('🔍 Desk container found:', document.querySelector('.desk-container') ? 'YES' : 'NO');
		}
	}
	
	// Simple Mobile Fix
	function improveMobileUI() {
		if (window.innerWidth <= 768) {
			console.log('📱 Applying simple mobile fix...');
			
			// Hide sidebar on mobile
			const sidebars = document.querySelectorAll('.layout-side-section, .desk-sidebar, .sidebar-section');
			sidebars.forEach(sidebar => {
				sidebar.style.display = 'none';
			});
			
			// Hide mobile header if it exists
			const mobileHeader = document.querySelector('.nt-mobile-header');
			if (mobileHeader) {
				mobileHeader.style.display = 'none';
				console.log('✅ Hidden mobile header');
			}
			
			// Make main content full width
			const main = document.querySelector('.layout-main-section');
			if (main) {
				main.style.width = '100%';
				main.style.maxWidth = '100%';
			}
			
			console.log('✅ Simple mobile fix applied');
		}
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
		
		// FINAL DESPERATE: Force hide sidebar on mobile immediately
		forceHideSidebarOnMobile();
		
		// Run it multiple times to ensure it works
		setTimeout(forceHideSidebarOnMobile, 25);
		setTimeout(forceHideSidebarOnMobile, 50);
		setTimeout(forceHideSidebarOnMobile, 100);
		setTimeout(forceHideSidebarOnMobile, 200);
		setTimeout(forceHideSidebarOnMobile, 500);
		setTimeout(forceHideSidebarOnMobile, 1000);
		setTimeout(forceHideSidebarOnMobile, 2000);
		setTimeout(forceHideSidebarOnMobile, 5000);
		
		// Also run on window resize
		window.addEventListener('resize', forceHideSidebarOnMobile);
		
		// Run on DOM mutations
		const observer = new MutationObserver(() => {
			if (window.innerWidth <= 768) {
				forceHideSidebarOnMobile();
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
		
		// Run on page load
		window.addEventListener('load', forceHideSidebarOnMobile);
		
		// Run on DOM ready
		document.addEventListener('DOMContentLoaded', forceHideSidebarOnMobile);
		
		// Initialize mobile layout
		initMobileLayout();
		
		// Initialize mobile menu functionality
		initMobileMenu();
		
		// Test mobile layout
		testMobileLayout();
		
		// Ensure proper viewport meta tag for mobile
		ensureViewportMeta();

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
// NUCLEAR MOBILE INITIALIZATION - MULTIPLE TRIGGERS
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded - Initializing mobile layout');
    initMobileLayout();
    testMobileLayout();
});

window.addEventListener('load', function() {
    console.log('🚀 Window Load - Initializing mobile layout');
    initMobileLayout();
    testMobileLayout();
});

window.addEventListener('resize', function() {
    console.log('🚀 Window Resize - Reinitializing mobile layout');
    initMobileLayout();
    testMobileLayout();
});

// Additional triggers for mobile layout
document.addEventListener('page-change', function() {
    console.log('🚀 Page Change - Reinitializing mobile layout');
    setTimeout(() => {
        initMobileLayout();
        testMobileLayout();
    }, 100);
});

// Force mobile layout every 500ms for first 5 seconds
let mobileCheckInterval = setInterval(() => {
    if (window.innerWidth <= 768) {
        initMobileLayout();
        testMobileLayout();
    }
}, 500);

setTimeout(() => {
    clearInterval(mobileCheckInterval);
}, 5000);

// Mutation observer to catch dynamically added elements
const observer = new MutationObserver((mutations) => {
    if (window.innerWidth <= 768) {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const className = node.className || '';
                        const id = node.id || '';
                        if (className.includes('sidebar') || id.includes('sidebar')) {
                            node.style.cssText = `
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                                width: 0 !important;
                                height: 0 !important;
                                overflow: hidden !important;
                                position: fixed !important;
                                left: -9999px !important;
                                top: -9999px !important;
                                z-index: -9999 !important;
                            `;
		}
	}
});

// Expose mobile functions globally
window.toggleMobileNav = toggleMobileNav;
window.closeMobileNav = closeMobileNav;
            }
        });
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});


