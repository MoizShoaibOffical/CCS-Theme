# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def create_test_data():
	"""Create test data for workspace sidebar"""
	
	# Create a test workspace
	if not frappe.db.exists("Workspace", "Test Workspace"):
		workspace_doc = frappe.get_doc({
			"doctype": "Workspace",
			"title": "Test Workspace",
			"label": "Test Workspace",
			"icon": "fa fa-test",
			"public": 1,
			"is_hidden": 0,
			"module": "Test Module",
			"content": "[]"
		})
		workspace_doc.insert(ignore_permissions=True)
		
		# Add some links to the workspace
		workspace_doc.append("links", {
			"label": "Home",
			"link_type": "Page",
			"link_to": "home",
			"is_query_report": 0
		})
		
		workspace_doc.append("links", {
			"label": "Dashboard",
			"link_type": "Page", 
			"link_to": "dashboard",
			"is_query_report": 0
		})
		
		workspace_doc.save()
	
	# Create a test Card Break Menu
	if not frappe.db.exists("Card Break Menu", "Accounting Menu"):
		card_menu_doc = frappe.get_doc({
			"doctype": "Card Break Menu",
			"menu_name": "Accounting",
			"menu_icon": "fa fa-calculator",
			"is_active": 1,
			"sort_order": 1,
			"description": "Accounting related menu items"
		})
		
		# Add sub-menu items
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Chart of Accounts",
			"link_type": "Doctype",
			"link_to": "Account",
			"is_active": 1,
			"sort_order": 1
		})
		
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Company",
			"link_type": "Doctype", 
			"link_to": "Company",
			"is_active": 1,
			"sort_order": 2
		})
		
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Customer",
			"link_type": "Doctype",
			"link_to": "Customer", 
			"is_active": 1,
			"sort_order": 3
		})
		
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Supplier",
			"link_type": "Doctype",
			"link_to": "Supplier",
			"is_active": 1,
			"sort_order": 4
		})
		
		card_menu_doc.insert(ignore_permissions=True)
	
	# Create another Card Break Menu for Stock
	if not frappe.db.exists("Card Break Menu", "Stock Menu"):
		card_menu_doc = frappe.get_doc({
			"doctype": "Card Break Menu",
			"menu_name": "Stock",
			"menu_icon": "fa fa-boxes",
			"is_active": 1,
			"sort_order": 2,
			"description": "Stock related menu items"
		})
		
		# Add sub-menu items
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Item",
			"link_type": "Doctype",
			"link_to": "Item",
			"is_active": 1,
			"sort_order": 1
		})
		
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Warehouse",
			"link_type": "Doctype",
			"link_to": "Warehouse",
			"is_active": 1,
			"sort_order": 2
		})
		
		card_menu_doc.append("sub_menu_items", {
			"item_label": "Brand",
			"link_type": "Doctype",
			"link_to": "Brand",
			"is_active": 1,
			"sort_order": 3
		})
		
		card_menu_doc.insert(ignore_permissions=True)
	
	frappe.db.commit()
	
	return {
		"status": "success",
		"message": "Test data created successfully! Refresh the page to see the new sidebar structure."
	}


@frappe.whitelist()
def clear_test_data():
	"""Clear test data"""
	
	# Delete test workspaces
	frappe.db.sql("DELETE FROM `tabWorkspace` WHERE title = 'Test Workspace'")
	
	# Delete test Card Break Menus
	frappe.db.sql("DELETE FROM `tabCard Break Menu` WHERE menu_name IN ('Accounting', 'Stock')")
	
	frappe.db.commit()
	
	return {
		"status": "success", 
		"message": "Test data cleared successfully!"
	}
