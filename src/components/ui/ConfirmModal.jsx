import React from "react";
import Modal from "./Modal";
import { FiAlertTriangle } from "react-icons/fi";

const GOLD = "#D4AF37";

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText = "Confirm Delete", type = "danger" }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2 text-red-500">
                    <FiAlertTriangle />
                    <span>{title || "Confirm Action"}</span>
                </div>
            }
            footer={
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${type === "danger"
                                ? "bg-red-500 text-white shadow-red-500/10 hover:bg-red-600"
                                : "bg-yellow-500 text-black shadow-yellow-500/10 hover:scale-105"
                            }`}
                        style={type !== "danger" ? { background: GOLD } : {}}
                    >
                        {confirmText}
                    </button>
                </div>
            }
        >
            <div className="text-gray-400 text-sm leading-relaxed">
                {message || "Are you sure you want to perform this action? This cannot be undone."}
            </div>
        </Modal>
    );
};

export default ConfirmModal;
