import axiosInstance from "./axiosInstance";

// ── Single signal extraction ──────────────────────────────────────────────────
// POST /signals/extract
// Body: { transcript, company_name?, user_id?, save_to_db }
export const extractSignal = async (transcript, companyName = null, userId = null, saveToDb = true) => {
    const res = await axiosInstance.post("/signals/extract", {
        transcript,
        company_name: companyName,
        user_id: userId,
        save_to_db: saveToDb,
    });
    return res.data; // SignalResponse
};

// ── Batch signal extraction ───────────────────────────────────────────────────
// POST /signals/batch
// Body: { transcripts: [{ text, company_name }], user_id?, save_to_db }
export const batchExtract = async (transcripts, userId = null, saveToDb = true) => {
    const res = await axiosInstance.post("/signals/batch", {
        transcripts,   // array of { text: "...", company_name: "..." }
        user_id: userId,
        save_to_db: saveToDb,
    });
    return res.data; // BatchSignalResponse: { signals, total, signals_found }
};

// ── Get all signals for a user ────────────────────────────────────────────────
// GET /signals/user/{user_id}?limit=50&currency_pair=...&direction=...
export const getUserSignals = async (userId, limit = 50, currencyPair = null, direction = null) => {
    const params = { limit };
    if (currencyPair) params.currency_pair = currencyPair;
    if (direction) params.direction = direction;

    const res = await axiosInstance.get(`/signals/user/${userId}`, { params });
    return res.data; // list[SavedSignalResponse]
};

// ── Get single signal ─────────────────────────────────────────────────────────
// GET /signals/user/{user_id}/{signal_id}
export const getSignalDetail = async (userId, signalId) => {
    const res = await axiosInstance.get(`/signals/user/${userId}/${signalId}`);
    return res.data; // SavedSignalResponse
};

// ── Get signal statistics ─────────────────────────────────────────────────────
// GET /signals/statistics/{user_id}
// Returns: { total_signals, by_currency_pair, by_direction, by_magnitude, average_confidence }
export const getSignalStats = async (userId) => {
    const res = await axiosInstance.get(`/signals/statistics/${userId}`);
    return res.data; // SignalStatisticsResponse
};

// ── Delete a signal ───────────────────────────────────────────────────────────
// DELETE /signals/{user_id}/{signal_id}
export const deleteSignal = async (userId, signalId) => {
    const res = await axiosInstance.delete(`/signals/${userId}/${signalId}`);
    return res.data; // DeleteSignalResponse: { message, signal_id }
};
