# Copyright (c) 2024, New Theme and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CardBreakMenu(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from new_theme.new_theme.doctype.card_break_menu_item.card_break_menu_item import CardBreakMenuItem

		description: DF.Text | None
		is_active: DF.Check
		menu_icon: DF.Data | None
		menu_name: DF.Data
		sort_order: DF.Int
		sub_menu_items: DF.Table[CardBreakMenuItem]

	# end: auto-generated types
	pass
