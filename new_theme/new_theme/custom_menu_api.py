# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_custom_menu():
	"""Get custom menu items for the sidebar"""
	
	# Check cache first
	cache_key = "custom_menu_cache"
	cached_menu = frappe.cache().get_value(cache_key)
	if cached_menu:
		return cached_menu
	
	# Get all active modules
	modules = frappe.get_all(
		"Custom Menu",
		filters={"is_active": 1},
		fields=["name", "module_name", "module_icon", "sort_order", "description"],
		order_by="sort_order, module_name"
	)
	
	# Build menu tree
	menu_tree = []
	for module in modules:
		# Get menu items from child table
		# Use frappe.get_doc to access child table data
		try:
			module_doc = frappe.get_doc("Custom Menu", module.name)
			menu_items = []
			for item in module_doc.menu_items:
				if item.is_active:
					menu_items.append({
						"name": item.name,
						"label": item.label,
						"link_type": item.link_type,
						"link_to": item.link_to,
						"parent_label": item.parent_label,
						"sort_order": item.sort_order,
						"description": item.description
					})
			# Sort menu items
			menu_items.sort(key=lambda x: (x["sort_order"], x["label"]))
		except:
			# If there's an error, return empty array
			menu_items = []
		
		# Build hierarchical structure for this module
		module_dict = {
			"name": module.name,
			"label": module.module_name,
			"icon": module.module_icon,
			"description": module.description,
			"children": build_module_menu_tree(menu_items)
		}
		menu_tree.append(module_dict)
	
	# Cache the result
	frappe.cache().set_value(cache_key, menu_tree, expires_in_sec=300)
	
	return menu_tree


def build_module_menu_tree(menu_items):
	"""Build hierarchical menu tree for a module"""
	
	# Find root items (no parent_label)
	root_items = [item for item in menu_items if not item.parent_label]
	
	# Build tree recursively
	def build_children(parent_label):
		children = []
		for item in menu_items:
			if item.parent_label == parent_label:
				item_dict = {
					"name": item.name,
					"label": item.label,
					"type": item.link_type,
					"route": item.link_to,
					"description": item.description,
					"children": build_children(item.label)
				}
				children.append(item_dict)
		return children
	
	# Build the complete tree
	tree = []
	for root_item in root_items:
		root_dict = {
			"name": root_item.name,
			"label": root_item.label,
			"type": root_item.link_type,
			"route": root_item.link_to,
			"description": root_item.description,
			"children": build_children(root_item.label)
		}
		tree.append(root_dict)
	
	return tree


@frappe.whitelist()
def clear_menu_cache():
	"""Clear the custom menu cache"""
	frappe.cache().delete_key("custom_menu_cache")
	return {"status": "success", "message": "Menu cache cleared"}

