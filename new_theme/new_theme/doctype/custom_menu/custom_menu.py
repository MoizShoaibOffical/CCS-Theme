# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CustomMenu(Document):
	def validate(self):
		# Validate module name is provided
		if not self.module_name:
			frappe.throw("Module Name is required")
		
		# Validate menu items
		for item in self.menu_items:
			if not item.label:
				frappe.throw("Label is required for all menu items")
			
			if item.link_type in ['Page', 'Doctype', 'Report'] and not item.link_to:
				frappe.throw(f"Link To is required for menu type: {item.link_type}")
	
	def on_update(self):
		# Clear cache when menu is updated
		frappe.cache().delete_key("custom_menu_cache")
	
	def on_trash(self):
		# Clear cache when menu is deleted
		frappe.cache().delete_key("custom_menu_cache")
