import frappe
from frappe.model.document import Document


class DashboardAssign(Document):
    def validate(self):
        if self.user and self.name != self.user:
            self.name = self.user

    def on_update(self):
        self._apply_to_user()

    def after_insert(self):
        self._apply_to_user()

    def _apply_to_user(self) -> None:
        if not (self.user and self.dashboard):
            return
        fields = ["nt_preferred_dashboard", "preferred_dashboard", "dashboard"]
        for field in fields:
            if frappe.db.has_column("User", field):
                frappe.db.set_value("User", self.user, field, self.dashboard)
                frappe.db.commit()
                break


