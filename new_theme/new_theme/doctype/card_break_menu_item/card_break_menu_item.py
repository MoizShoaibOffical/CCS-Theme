# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CardBreakMenuItem(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		description: DF.Text | None
		is_active: DF.Check
		item_label: DF.Data
		link_to: DF.Data
		link_type: DF.Literal["Doctype", "Page", "Report", "Link", "Workspace"]
		sort_order: DF.Int

	# end: auto-generated types
	pass
