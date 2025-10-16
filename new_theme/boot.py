import frappe
from frappe.permissions import get_doctypes_with_read


def add_theme_to_boot(bootinfo: "frappe._dict") -> None:
	"""Attach minimal theme info to boot and provide sidebar config.

	We no longer depend on a settings doctype; layout is enforced in JS.
	Now using workspace-based sidebar instead of menu doctype.
	"""
	try:
		# Minimal new_theme_settings (could be extended later if needed)
		try:
			# Safely resolve brand details without assuming keys exist
			brand_name = getattr(frappe.conf, "brand_name", None) or frappe.db.get_default("company") or "NewDesk"
		except Exception:
			brand_name = "NewDesk"

		bootinfo["new_theme_settings"] = {
			"brand_name": brand_name,
			# ship a default app logo; can be overridden by settings via brand_logo
			"brand_logo": "/assets/new_theme/img/logo.svg",
		}
		
		# Get workspace-based sidebar config
		try:
			from new_theme.new_theme.api.workspace_sidebar import get_workspace_sidebar
			workspace_sidebar = get_workspace_sidebar()
			bootinfo["workspace_sidebar_config"] = workspace_sidebar
		except Exception as e:
			frappe.log_error(f"Error loading workspace sidebar: {str(e)}")
			bootinfo["workspace_sidebar_config"] = []
		
		# Keep old sidebar config for backward compatibility
		cfg = []
		try:
			readable = set(get_doctypes_with_read())
			if readable:
				dt_rows = frappe.get_all(
					"DocType",
					filters={"name": ("in", list(readable)), "istable": 0},
					fields=["name", "module"], limit=1000,
				)
				mod_to_items = {}
				for r in dt_rows:
					mod_to_items.setdefault(r.module or "Other", []).append({"type": "doctype", "name": r.name})
				rpt_rows = frappe.get_all(
					"Report", filters={"disabled": 0}, fields=["name", "ref_doctype", "module"], limit=1000,
				)
				for rr in rpt_rows:
					if not rr.ref_doctype or rr.ref_doctype in readable:
						mod_to_items.setdefault(rr.module or "Other", []).append({"type": "report", "name": rr.name})
				cfg = [{"label": mod, "items": items} for mod, items in sorted(mod_to_items.items(), key=lambda x: x[0])]
		except Exception:
			cfg = []
		bootinfo["new_theme_sidebar_config"] = cfg
	except Exception:
		# Ignore missing doctype during install or if not migrated yet
		pass

