import frappe

@frappe.whitelist()
def add_dashboard_to_home():
	"""Add Dashboard link to Home workspace"""
	
	try:
		# First, create the Page if it doesn't exist
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
			# Create Home workspace if it doesn't exist
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
		
		# Import json for content manipulation
		import json
		
		# Get existing content or initialize
		if home_doc.content:
			try:
				content_list = json.loads(home_doc.content)
			except:
				content_list = []
		else:
			content_list = []
		
		# Check if dashboard block already exists
		dashboard_exists = False
		for item in content_list:
			if item.get("type") == "custom_block" and item.get("data", {}).get("custom_block_name") == "Dashboard":
				dashboard_exists = True
				break
		
		if not dashboard_exists:
			# Create custom HTML block for dashboard
			# First check if Custom HTML Block exists, if not create it
			if not frappe.db.exists("Custom HTML Block", "Dashboard"):
				custom_block = frappe.new_doc("Custom HTML Block")
				custom_block.name = "Dashboard"
				custom_block.html = """
<div id="dashboard-container" style="width: 100%; min-height: 800px;">
	<iframe 
		id="dashboard-iframe"
		src="/dashboard" 
		style="width: 100%; min-height: 800px; border: none;"
		frameborder="0"
		scrolling="yes"
		onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px';">
	</iframe>
</div>
<script>
	// Auto-resize iframe
	setInterval(function() {
		var iframe = document.getElementById('dashboard-iframe');
		if (iframe && iframe.contentWindow) {
			try {
				iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
			} catch(e) {}
		}
	}, 1000);
</script>
				"""
				custom_block.insert(ignore_permissions=True)
				frappe.db.commit()
			
			# Add dashboard block at the beginning of content
			dashboard_block = {
				"id": "dashboard-block",
				"type": "custom_block",
				"data": {
					"custom_block_name": "Dashboard",
					"col": 12
				}
			}
			
			# Insert at beginning
			content_list.insert(0, dashboard_block)
			
			# Update workspace content
			home_doc.content = json.dumps(content_list)
			home_doc.save(ignore_permissions=True)
			frappe.db.commit()
			frappe.clear_cache(doctype="Workspace")
			
			return {"status": "success", "message": "Dashboard added to Home workspace content"}
		else:
			return {"status": "exists", "message": "Dashboard already exists in Home workspace"}
			
	except Exception as e:
		frappe.log_error(f"Error adding dashboard to home: {str(e)}", "Dashboard Home Link Error")
		return {"status": "error", "message": str(e)}

