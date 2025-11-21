# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_workspace_sidebar():
	"""Get sidebar menu items from workspace Link Cards section"""
	
	# Check cache first
	cache_key = "workspace_sidebar_cache"
	cached_menu = frappe.cache().get_value(cache_key)
	if cached_menu:
		return cached_menu
	
	# Get all active workspaces
	workspaces = frappe.get_all(
		"Workspace",
		filters={"is_hidden": 0, "public": 1},
		fields=["name", "title", "icon", "module"],
		order_by="title ASC"
	)
	
	# Build menu tree from workspaces
	menu_tree = []
	for workspace in workspaces:
		# Get workspace doc to access links
		try:
			workspace_doc = frappe.get_doc("Workspace", workspace.name)
			
			# Get links from workspace
			workspace_links = []
			for link in workspace_doc.links:
				if link.is_query_report != 1:  # Skip query reports for now
					workspace_links.append({
						"label": link.label,
						"link_type": link.link_type,
						"link_to": link.link_to,
						"dependencies": link.dependencies,
						"only_for": link.only_for,
						"onboard": link.onboard,
						"is_query_report": link.is_query_report,
						"type": link.type
					})
			
			# Get Card Break Menus for this workspace
			# For now, we'll get all active Card Break Menus
			# In a real implementation, you might want to link Card Break Menus to specific workspaces
			card_break_menus = frappe.get_all(
				"Card Break Menu",
				filters={"is_active": 1},
				fields=["name", "menu_name", "menu_icon", "sort_order", "description"],
				order_by="sort_order, menu_name"
			)
			
			# Only add Card Break Menus to specific workspaces to avoid repetition
			# For now, let's only add them to the first few workspaces
			if workspace.name in ["Home", "Accounting", "Stock"]:
				# Build sub-menus from Card Break Menus
				sub_menus = []
				for card_menu in card_break_menus:
					try:
						card_menu_doc = frappe.get_doc("Card Break Menu", card_menu.name)
						sub_menu_items = []
						
						for item in card_menu_doc.sub_menu_items:
							if item.is_active:
								sub_menu_items.append({
									"label": item.item_label,
									"link_type": item.link_type,
									"link_to": item.link_to,
									"sort_order": item.sort_order,
									"description": item.description
								})
						
						# Sort sub-menu items
						sub_menu_items.sort(key=lambda x: (x["sort_order"], x["label"]))
						
						sub_menus.append({
							"name": card_menu.name,
							"label": card_menu.menu_name,
							"icon": card_menu.menu_icon,
							"description": card_menu.description,
							"children": sub_menu_items
						})
					except:
						# If there's an error, skip this card menu
						continue
			else:
				sub_menus = []
			
			# Sort sub-menus
			sub_menus.sort(key=lambda x: (x.get("sort_order", 0), x["label"]))
			
			# Build workspace module structure
			workspace_module = {
				"name": workspace.name,
				"label": workspace.title,
				"icon": workspace.icon,
				"module": workspace.module or workspace.title,  # Use workspace name as module
				"description": f"Workspace: {workspace.title}",
				"workspace_links": workspace_links,
				"sub_menus": sub_menus
			}
			
			menu_tree.append(workspace_module)
			
		except Exception as e:
			# If there's an error accessing workspace, skip it
			frappe.log_error(f"Error accessing workspace {workspace.name}: {str(e)}")
			continue
	
	# Sort menu tree alphabetically by label (title)
	menu_tree.sort(key=lambda x: (x.get("label", "").lower() if x.get("label") else ""))
	
	# Cache the result
	frappe.cache().set_value(cache_key, menu_tree, expires_in_sec=300)
	
	return menu_tree


@frappe.whitelist()
def clear_workspace_sidebar_cache():
	"""Clear workspace sidebar cache"""
	frappe.cache().delete_key("workspace_sidebar_cache")
	return {"status": "success", "message": "Cache cleared"}
