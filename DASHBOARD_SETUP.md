# Dashboard Setup Instructions

## Add Dashboard to Home Workspace

Dashboard ko Home workspace me add karne ke liye neeche diye gaye steps follow karein:

### Method 1: Browser Console (Easiest)

1. Frappe application me login karein
2. Browser console open karein (F12 ya Ctrl+Shift+I)
3. Neeche diya hua code run karein:

```javascript
frappe.call({
    method: 'new_theme.api.add_dashboard_to_home.add_dashboard_to_home',
    callback: function(r) {
        if (r.message.status === 'success') {
            frappe.show_alert({
                message: 'Dashboard link added successfully!',
                indicator: 'green'
            }, 5);
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else if (r.message.status === 'exists') {
            frappe.show_alert({
                message: 'Dashboard link already exists!',
                indicator: 'blue'
            }, 5);
        } else {
            frappe.show_alert({
                message: 'Error: ' + r.message.message,
                indicator: 'red'
            }, 5);
        }
    }
});
```

### Method 2: Bench Command

Terminal me run karein:

```bash
bench --site <your_site_name> execute new_theme.add_dashboard_link.add_dashboard_link
```

### Method 3: Frappe Console

```bash
bench --site <your_site_name> console
```

Phir console me:

```python
from new_theme.add_dashboard_link import add_dashboard_link
add_dashboard_link()
```

## After Setup

1. Page refresh karein (Ctrl+R ya F5)
2. Home workspace me **top par Dashboard directly embed hoga**
3. Dashboard Home page ke content area me dikhega, alag se link ki zarurat nahi

## Troubleshooting

Agar dashboard link nahi dikh raha:
1. Cache clear karein: `bench --site <site> clear-cache`
2. Browser cache clear karein (Ctrl+Shift+Delete)
3. Page refresh karein

