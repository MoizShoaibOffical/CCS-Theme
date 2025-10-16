# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute():
	"""Migrate from Custom Menu to Workspace-based Sidebar"""
	
	# Check if Custom Menu doctype exists
	if not frappe.db.exists("DocType", "Custom Menu"):
		return
		
	# Get all Custom Menu records
	custom_menus = frappe.get_all("Custom Menu", fields=["name", "module_name", "module_icon", "description"])
	
	if not custom_menus:
		return
		
	frappe.msgprint(_("Starting migration from Custom Menu to Workspace-based Sidebar..."))
	
	# Create a default workspace for each custom menu
	for menu in custom_menus:
		try:
			# Check if workspace already exists
			if frappe.db.exists("Workspace", menu.module_name):
				continue
				
			# Create workspace
			workspace_doc = frappe.get_doc({
				"doctype": "Workspace",
				"title": menu.module_name,
				"label": menu.module_name,
				"icon": menu.module_icon or "fa fa-folder",
				"public": 1,
				"is_hidden": 0,
				"module": menu.module_name,
				"content": "[]"
			})
			workspace_doc.insert(ignore_permissions=True)
			
			# Get menu items from Custom Menu
			menu_doc = frappe.get_doc("Custom Menu", menu.name)
			
			# Create Card Break Menu for sub-menus
			if menu_doc.menu_items:
				card_break_menu_doc = frappe.get_doc({
					"doctype": "Card Break Menu",
					"menu_name": f"{menu.module_name} Menu",
					"menu_icon": menu.module_icon or "fa fa-list",
					"is_active": 1,
					"description": f"Sub-menu items for {menu.module_name}"
				})
				
				# Add menu items as sub-menu items
				for item in menu_doc.menu_items:
					if item.is_active:
						card_break_menu_doc.append("sub_menu_items", {
							"item_label": item.label,
							"link_type": item.link_type,
							"link_to": item.link_to,
							"is_active": 1,
							"sort_order": item.sort_order,
							"description": item.description
						})
				
				card_break_menu_doc.insert(ignore_permissions=True)
			
			frappe.db.commit()
			
		except Exception as e:
			frappe.log_error(f"Error migrating Custom Menu {menu.name}: {str(e)}")
			continue
	
	frappe.msgprint(_("Migration completed! Please refresh your browser to see the new workspace-based sidebar."))
	
	# Clear caches
	frappe.cache().delete_key("workspace_sidebar_cache")
	frappe.cache().delete_key("custom_menu_cache")
