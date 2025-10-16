import frappe
import json

@frappe.whitelist()
def save_theme_prefs(prefs: dict | None = None, global_prefs: int | bool = 0):
    """Persist theme prefs.
    - If global_prefs is truthy and user is Administrator, store as a site-wide default so all users get it
    - Otherwise store per-user prefs (DocType if available, else user default)
    """
    if not frappe.session.user:
        return
    prefs_json = frappe.as_json(prefs or {})

    # Save globally (site-wide) if requested and permitted
    try:
        is_admin = frappe.session.user == "Administrator" or "Administrator" in (frappe.get_roles() or [])
    except Exception:
        is_admin = False
    if int(global_prefs or 0) and is_admin:
        frappe.db.set_default("nt_theme_prefs_global", prefs_json)
        frappe.db.commit()
        return True

    # Otherwise save for current user
    if _has_doctype():
        doc = _get_doc()
        doc.prefs_json = prefs_json
        doc.save(ignore_permissions=True)
        frappe.db.commit()
    else:
        frappe.defaults.set_user_default("nt_theme_prefs", prefs_json)
    return True

@frappe.whitelist()
def get_theme_prefs():
    if not frappe.session.user:
        return {}

    user_prefs = {}

    # 1) Try DocType-backed prefs (if installed)
    if _has_doctype():
        try:
            doc = _get_doc()
            user_prefs = frappe.parse_json(doc.prefs_json or "{}") or {}
        except Exception:
            user_prefs = {}

    # 2) If empty, try legacy per-user defaults
    if not user_prefs:
        try:
            val = frappe.defaults.get_user_default("nt_theme_prefs")
            user_prefs = json.loads(val) if val else {}
        except Exception:
            user_prefs = {}

    # 3) If still empty, return global site-wide default (saved by Administrator)
    if not user_prefs:
        try:
            global_val = frappe.db.get_default("nt_theme_prefs_global")
            user_prefs = json.loads(global_val) if global_val else {}
        except Exception:
            user_prefs = {}

    return user_prefs

@frappe.whitelist()
def clear_theme_prefs():
    if not frappe.session.user:
        return
    if _has_doctype():
        doc = _get_doc()
        doc.prefs_json = '{}'
        doc.save(ignore_permissions=True)
        frappe.db.commit()
    else:
        frappe.defaults.clear_user_default("nt_theme_prefs")
    return True

def _get_doc():
    name = f"Theme Preferences-{frappe.session.user}"
    if frappe.db.exists('Theme Preferences', name):
        return frappe.get_doc('Theme Preferences', name)
    doc = frappe.new_doc('Theme Preferences')
    doc.user = frappe.session.user
    doc.name = name
    doc.prefs_json = '{}'
    doc.insert(ignore_permissions=True)
    return doc

def _has_doctype() -> bool:
    try:
        return frappe.db.table_exists('tabTheme Preferences')
    except Exception:
        return False

