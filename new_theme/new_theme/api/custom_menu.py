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
	
	# Get all active menu items
	menu_items = frappe.get_all(
		"Custom Menu",
		filters={"is_active": 1},
		fields=[
			"name", "menu_name", "menu_label", "menu_icon", 
			"menu_type", "route", "parent_menu", "sort_order", "description"
		],
		order_by="sort_order, menu_label"
	)
	
	# Build menu tree
	menu_tree = build_menu_tree(menu_items)
	
	# Cache the result
	frappe.cache().set_value(cache_key, menu_tree, expires_in_sec=300)
	
	return menu_tree


def build_menu_tree(menu_items):
	"""Build hierarchical menu tree from flat list"""
	
	# Create a dictionary for quick lookup
	menu_dict = {item.name: item for item in menu_items}
	
	# Find root items (no parent)
	root_items = [item for item in menu_items if not item.parent_menu]
	
	# Build tree recursively
	def build_children(parent_name):
		children = []
		for item in menu_items:
			if item.parent_menu == parent_name:
				item_dict = {
					"name": item.name,
					"label": item.menu_label,
					"icon": item.menu_icon,
					"type": item.menu_type,
					"route": item.route,
					"description": item.description,
					"children": build_children(item.name)
				}
				children.append(item_dict)
		return children
	
	# Build the complete tree
	tree = []
	for root_item in root_items:
		root_dict = {
			"name": root_item.name,
			"label": root_item.menu_label,
			"icon": root_item.menu_icon,
			"type": root_item.menu_type,
			"route": root_item.route,
			"description": root_item.description,
			"children": build_children(root_item.name)
		}
		tree.append(root_dict)
	
	return tree


@frappe.whitelist()
def clear_menu_cache():
	"""Clear the custom menu cache"""
	frappe.cache().delete_key("custom_menu_cache")
	return {"status": "success", "message": "Menu cache cleared"}
