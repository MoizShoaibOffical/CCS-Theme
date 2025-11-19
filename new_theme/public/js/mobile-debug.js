// Mobile Debug Script for New Theme
// Add this to browser console to debug mobile issues

(function() {
    console.log('🔧 Mobile Debug Script Loaded');
    
    // Mobile detection
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Check mobile layout status
    function checkMobileLayout() {
        console.log('📱 Mobile Layout Check:');
        console.log('Screen width:', window.innerWidth);
        console.log('Is mobile:', isMobile());
        
        // Check sidebar visibility
        const sidebars = document.querySelectorAll('.nt-sidebar, .standard-sidebar, .desk-sidebar');
        console.log('Sidebars found:', sidebars.length);
        sidebars.forEach((sidebar, index) => {
            const style = window.getComputedStyle(sidebar);
            console.log(`Sidebar ${index + 1}:`, {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                transform: style.transform
            });
        });
        
        // Check mobile header
        const mobileHeader = document.querySelector('.nt-mobile-header');
        console.log('Mobile header found:', !!mobileHeader);
        
        // Check mobile navigation
        const mobileNav = document.querySelector('.nt-mobile-nav');
        console.log('Mobile navigation found:', !!mobileNav);
        
        // Check CSS loading
        const themeCSS = document.querySelector('link[href*="new_theme.css"]');
        console.log('New Theme CSS loaded:', !!themeCSS);
        
        return {
            isMobile: isMobile(),
            sidebars: sidebars.length,
            mobileHeader: !!mobileHeader,
            mobileNav: !!mobileNav,
            themeCSS: !!themeCSS
        };
    }
    
    // Force mobile layout
    function forceMobileLayout() {
        console.log('🚀 Forcing mobile layout...');
        
        // Hide all sidebars
        const sidebarSelectors = [
            '.nt-sidebar', '.standard-sidebar', '.desk-sidebar', 
            '.sidebar-section', '.layout-side-section', '.sidebar'
        ];
        
        sidebarSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.transform = 'translateX(-100%)';
            });
        });
        
        // Create mobile header if not exists
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
                    <button class="nt-btn" id="nt-mobile-add" title="Add New">+</button>
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
        
        // Adjust main content
        const main = document.querySelector('.nt-main, .desk-container');
        if (main) {
            main.style.gridTemplateColumns = '1fr';
            main.style.paddingTop = '60px';
        }
        
        console.log('✅ Mobile layout forced');
    }
    
    // Test mobile functionality
    function testMobileFeatures() {
        console.log('🧪 Testing mobile features...');
        
        const tests = {
            'Screen width check': window.innerWidth <= 768,
            'Sidebar hidden': document.querySelectorAll('.nt-sidebar[style*="display: none"]').length > 0,
            'Mobile header exists': !!document.querySelector('.nt-mobile-header'),
            'Main content full width': document.querySelector('.nt-main')?.style.gridTemplateColumns === '1fr',
            'CSS loaded': !!document.querySelector('link[href*="new_theme.css"]')
        };
        
        Object.entries(tests).forEach(([test, result]) => {
            console.log(`${result ? '✅' : '❌'} ${test}: ${result}`);
        });
        
        return tests;
    }
    
    // Expose functions to global scope
    window.mobileDebug = {
        check: checkMobileLayout,
        force: forceMobileLayout,
        test: testMobileFeatures,
        isMobile: isMobile
    };
    
    // Auto-run on mobile
    if (isMobile()) {
        console.log('📱 Mobile detected, running auto-checks...');
        setTimeout(() => {
            checkMobileLayout();
            testMobileFeatures();
        }, 1000);
    }
    
    console.log('🔧 Mobile Debug Commands:');
    console.log('mobileDebug.check() - Check mobile layout status');
    console.log('mobileDebug.force() - Force mobile layout');
    console.log('mobileDebug.test() - Test mobile features');
    console.log('mobileDebug.isMobile() - Check if mobile');
    
})();
