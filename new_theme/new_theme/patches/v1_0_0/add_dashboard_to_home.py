"""
Patch to add Dashboard link to Home workspace
This will run automatically on migrate
"""

import frappe

def execute():
	"""Add Dashboard page and link to Home workspace"""
	
	# Create Dashboard Page if it doesn't exist
	if not frappe.db.exists("Page", "dashboard"):
		page_doc = frappe.new_doc("Page")
		page_doc.name = "dashboard"
		page_doc.page_name = "dashboard"
		page_doc.title = "Dashboard"
		page_doc.module = "New Theme"
		page_doc.standard = "No"
		page_doc.insert(ignore_permissions=True)
		frappe.db.commit()
		frappe.clear_cache(doctype="Page")
	
	# Get or create Home workspace
	if not frappe.db.exists("Workspace", "Home"):
		home_doc = frappe.new_doc("Workspace")
		home_doc.name = "Home"
		home_doc.title = "Home"
		home_doc.icon = "home"
		home_doc.is_hidden = 0
		home_doc.public = 1
		home_doc.module = "Home"
		home_doc.insert(ignore_permissions=True)
		frappe.db.commit()
	
	# Get Home workspace
	home_doc = frappe.get_doc("Workspace", "Home")
	
	# Check if dashboard link already exists
	dashboard_exists = False
	for link in home_doc.links:
		if link.link_type == "Page" and link.link_to == "dashboard":
			dashboard_exists = True
			break
	
	if not dashboard_exists:
		# Add dashboard link at the beginning
		home_doc.insert(0, "links", {
			"label": "Dashboard",
			"type": "Link",
			"link_type": "Page",
			"link_to": "dashboard",
			"hidden": 0,
			"is_query_report": 0
		})
		
		home_doc.save(ignore_permissions=True)
		frappe.db.commit()
		frappe.clear_cache(doctype="Workspace")

