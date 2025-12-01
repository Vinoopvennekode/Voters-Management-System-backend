import Voter from "../models/voterModel.js";
import Ward from "../models/wardModel.js";
import mongoose from "mongoose";
import PollingStation from "../models/pollingStationModel.js";

// export const getVotingSummary = async (req, res) => {
//     try {
//         const user = req.user;
//         console.log(user);

//         if (!user) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         let matchFilter = {};

//         // 🧠 1️⃣ Apply data scope based on role
//         if (user.role === "SuperAdmin") {
//             // 🧭 Step 1: Get all wards under this Local Body
//             const wardIds = await Ward.find({ localBodyId: user.localBodyId }).distinct("_id");

//             // 🧭 Step 2: Get all polling stations under these wards (optional)
//             const pollingIds = await PollingStation.find({
//                 wardId: { $in: wardIds },
//             }).distinct("_id");

//             // 🧭 Step 3: Match voters under these wards or polling stations
//             matchFilter = {
//                 $or: [
//                     { wardId: { $in: wardIds } },
//                     { pollingStationId: { $in: pollingIds } },
//                 ],
//             };
//         } else if (user.role === "Admin") {
//             matchFilter.wardId = user.wardId;
//         } else if (user.role === "Volunteer") {
//             matchFilter.pollingStationId = user.pollingStationId;
//         } else {
//             return res
//                 .status(403)
//                 .json({ success: false, message: "Invalid role access" });
//         }
//         console.log('matchFilter', matchFilter);

//         // 🧮 2️⃣ Calculate total & voted count
//         const [totalVoters, votedCount] = await Promise.all([
//             Voter.countDocuments(matchFilter),
//             Voter.countDocuments({ ...matchFilter, voted: true }),
//         ]);
//         console.log('total ', votedCount, totalVoters);

//         const turnout =
//             totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : "0.00";

//         // 🗂️ 3️⃣ Prepare report containers
//         let wardSummary = [];
//         let pollingSummary = [];

//         // 🏛️ 4️⃣ SuperAdmin → Ward-level aggregation
//         if (user.role === "SuperAdmin") {
//             wardSummary = await Voter.aggregate([
//                 { $match: matchFilter },
//                 {
//                     $group: {
//                         _id: "$wardId",
//                         totalVoters: { $sum: 1 },
//                         voted: { $sum: { $cond: ["$voted", 1, 0] } },
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: "wards",
//                         localField: "_id",
//                         foreignField: "_id",
//                         as: "ward",
//                     },
//                 },
//                 { $unwind: "$ward" },
//                 {
//                     $project: {
//                         _id: 0,
//                         wardId: "$ward._id",
//                         wardName: "$ward.name",
//                         totalVoters: 1,
//                         voted: 1,
//                         turnout: {
//                             $cond: [
//                                 { $eq: ["$totalVoters", 0] },
//                                 "0.00",
//                                 {
//                                     $round: [
//                                         { $multiply: [{ $divide: ["$voted", "$totalVoters"] }, 100] },
//                                         2,
//                                     ],
//                                 },
//                             ],
//                         },
//                     },
//                 },
//             ]);
//         }

//         // 🏫 5️⃣ Admin → Polling Station-level aggregation
//         if (user.role === "Admin" || user.role === "SuperAdmin") {
//             pollingSummary = await Voter.aggregate([
//                 { $match: matchFilter },
//                 {
//                     $group: {
//                         _id: "$pollingStationId",
//                         totalVoters: { $sum: 1 },
//                         voted: { $sum: { $cond: ["$voted", 1, 0] } },
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: "pollingstations",
//                         localField: "_id",
//                         foreignField: "_id",
//                         as: "pollingStation",
//                     },
//                 },
//                 { $unwind: "$pollingStation" },
//                 {
//                     $project: {
//                         _id: 0,
//                         pollingStationId: "$pollingStation._id",
//                         pollingStationName: "$pollingStation.name",
//                         wardId: "$pollingStation.wardId",
//                         totalVoters: 1,
//                         voted: 1,
//                         turnout: {
//                             $cond: [
//                                 { $eq: ["$totalVoters", 0] },
//                                 "0.00",
//                                 {
//                                     $round: [
//                                         { $multiply: [{ $divide: ["$voted", "$totalVoters"] }, 100] },
//                                         2,
//                                     ],
//                                 },
//                             ],
//                         },
//                     },
//                 },
//             ]);
//         }

//         // 🗳️ 6️⃣ Volunteer → Only their polling station (no grouping)
//         if (user.role === "Volunteer") {
//             const booth = await PollingStation.findById(user.pollingStationId)
//                 .select("name wardId")
//                 .populate("wardId", "name");

//             pollingSummary = [
//                 {
//                     pollingStationId: booth._id,
//                     pollingStationName: booth.name,
//                     wardId: booth.wardId?._id,
//                     wardName: booth.wardId?.name,
//                     totalVoters,
//                     voted: votedCount,
//                     turnout,
//                 },
//             ];
//         }

//         // ✅ 7️⃣ Final response
//         res.status(200).json({
//             success: true,
//             summary: {
//                 totalVoters,
//                 voted: votedCount,
//                 turnout,
//             },
//             wardSummary,
//             pollingSummary,
//         });
//     } catch (error) {
//         console.error("❌ Error generating report:", error);
//         res
//             .status(500)
//             .json({ success: false, message: "Server error", error: error.message });
//     }
// };
export const getVotingSummary = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let matchFilter = {};

        // 🧠 Role-based data filtering
        if (user.role === "SuperAdmin") {
            const wardIds = await Ward.find({ localBodyId: user.localBodyId }).distinct("_id");
            const pollingIds = await PollingStation.find({ wardId: { $in: wardIds } }).distinct("_id");

            matchFilter = {
                $or: [
                    { wardId: { $in: wardIds } },
                    { pollingStationId: { $in: pollingIds } },
                ],
            };
        } else if (user.role === "Admin") {
            matchFilter.wardId = user.wardId;
        } else if (user.role === "Volunteer") {
            matchFilter.pollingStationId = user.pollingStationId;
        } else {
            return res.status(403).json({ success: false, message: "Invalid role access" });
        }

        // 🧮 Basic totals
        const [totalVoters, votedCount] = await Promise.all([
            Voter.countDocuments(matchFilter),
            Voter.countDocuments({ ...matchFilter, voted: true }),
        ]);
        const turnout = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : "0.00";

        let wardSummary = [];
        let pollingSummary = [];
        let partySummary = [];
        let wardPartySummary = [];

        // 🏛️ Ward Summary
        if (user.role === "SuperAdmin") {
            wardSummary = await Voter.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: "$wardId",
                        totalVoters: { $sum: 1 },
                        voted: { $sum: { $cond: ["$voted", 1, 0] } },
                    },
                },
                {
                    $lookup: {
                        from: "wards",
                        localField: "_id",
                        foreignField: "_id",
                        as: "ward",
                    },
                },
                { $unwind: "$ward" },
                {
                    $project: {
                        _id: 0,
                        wardId: "$ward._id",
                        wardName: "$ward.name",
                        totalVoters: 1,
                        voted: 1,
                        turnout: {
                            $cond: [
                                { $eq: ["$totalVoters", 0] },
                                "0.00",
                                {
                                    $round: [
                                        { $multiply: [{ $divide: ["$voted", "$totalVoters"] }, 100] },
                                        2,
                                    ],
                                },
                            ],
                        },
                    },
                },
            ]);
        }

        // 🏫 Polling Station Summary
        if (["Admin", "SuperAdmin"].includes(user.role)) {
            pollingSummary = await Voter.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: "$pollingStationId",
                        totalVoters: { $sum: 1 },
                        voted: { $sum: { $cond: ["$voted", 1, 0] } },
                    },
                },
                {
                    $lookup: {
                        from: "pollingstations",
                        localField: "_id",
                        foreignField: "_id",
                        as: "pollingStation",
                    },
                },
                { $unwind: "$pollingStation" },
                {
                    $project: {
                        _id: 0,
                        pollingStationId: "$pollingStation._id",
                        pollingStationName: "$pollingStation.name",
                        wardId: "$pollingStation.wardId",
                        totalVoters: 1,
                        voted: 1,
                        turnout: {
                            $cond: [
                                { $eq: ["$totalVoters", 0] },
                                "0.00",
                                {
                                    $round: [
                                        { $multiply: [{ $divide: ["$voted", "$totalVoters"] }, 100] },
                                        2,
                                    ],
                                },
                            ],
                        },
                    },
                },
            ]);
        }

        // 🗳️ Volunteer Summary
        if (user.role === "Volunteer") {
            const booth = await PollingStation.findById(user.pollingStationId)
                .select("name wardId")
                .populate("wardId", "name");

            pollingSummary = [
                {
                    pollingStationId: booth._id,
                    pollingStationName: booth.name,
                    wardId: booth.wardId?._id,
                    wardName: booth.wardId?.name,
                    totalVoters,
                    voted: votedCount,
                    turnout,
                },
            ];
        }

        // 🟢 Overall Party Summary
        partySummary = await Voter.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: "$partySupport",
                    totalVoters: { $sum: 1 },
                    voted: { $sum: { $cond: ["$voted", 1, 0] } },
                },
            },
            {
                $lookup: {
                    from: "parties",
                    localField: "_id",
                    foreignField: "_id",
                    as: "party",
                },
            },
            { $unwind: "$party" },
            {
                $project: {
                    _id: 0,
                    partyId: "$party._id",
                    partyName: "$party.name",
                    color: "$party.color",
                    totalVoters: 1,
                    voted: 1,
                    turnout: {
                        $cond: [
                            { $eq: ["$totalVoters", 0] },
                            "0.00",
                            {
                                $round: [
                                    { $multiply: [{ $divide: ["$voted", "$totalVoters"] }, 100] },
                                    2,
                                ],
                            },
                        ],
                    },
                },
            },
            { $sort: { voted: -1 } },
        ]);

        // 🟠 Ward Party Summary (grouped)
        const wardPartyData = await Voter.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { wardId: "$wardId", partyId: "$partySupport" },
                    voted: { $sum: { $cond: ["$voted", 1, 0] } },
                },
            },
            {
                $lookup: {
                    from: "wards",
                    localField: "_id.wardId",
                    foreignField: "_id",
                    as: "ward",
                },
            },
            { $unwind: "$ward" },
            {
                $lookup: {
                    from: "parties",
                    localField: "_id.partyId",
                    foreignField: "_id",
                    as: "party",
                },
            },
            { $unwind: "$party" },
            {
                $project: {
                    _id: 0,
                    wardId: "$ward._id",
                    wardName: "$ward.name",
                    partyName: "$party.name",
                    voted: 1,
                },
            },
        ]);

        // ✅ Group Ward Parties
        wardPartySummary = Object.values(
            wardPartyData.reduce((acc, item) => {
                if (!acc[item.wardId]) {
                    acc[item.wardId] = { wardId: item.wardId, wardName: item.wardName, parties: [] };
                }
                acc[item.wardId].parties.push({ partyName: item.partyName, voted: item.voted });
                return acc;
            }, {})
        );

        // 🔵 Polling Party Summary (grouped)
        const pollingPartyData = await Voter.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { pollingStationId: "$pollingStationId", partyId: "$partySupport" },
                    voted: { $sum: { $cond: ["$voted", 1, 0] } },
                },
            },
            {
                $lookup: {
                    from: "pollingstations",
                    localField: "_id.pollingStationId",
                    foreignField: "_id",
                    as: "pollingStation",
                },
            },
            { $unwind: "$pollingStation" },
            {
                $lookup: {
                    from: "parties",
                    localField: "_id.partyId",
                    foreignField: "_id",
                    as: "party",
                },
            },
            { $unwind: "$party" },
            {
                $project: {
                    _id: 0,
                    pollingStationId: "$pollingStation._id",
                    pollingStationName: "$pollingStation.name",
                    partyName: "$party.name",
                    voted: 1,
                },
            },
        ]);

        // ✅ Merge Parties into Polling Summary
        const groupedPollingParty = pollingPartyData.reduce((acc, item) => {
            if (!acc[item.pollingStationId]) {
                acc[item.pollingStationId] = [];
            }
            acc[item.pollingStationId].push({
                partyName: item.partyName,
                voted: item.voted,
            });
            return acc;
        }, {});

        // 🔗 Attach parties to polling summary
        pollingSummary = pollingSummary.map(poll => ({
            ...poll,
            parties: groupedPollingParty[poll.pollingStationId] || [],
        }));

        // ✅ Final Response
        res.status(200).json({
            success: true,
            summary: { totalVoters, voted: votedCount, turnout },
            wardSummary,
            pollingSummary, // now includes party details
            partySummary,
            wardPartySummary,
        });
    } catch (error) {
        console.error("❌ Error generating report:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};



export const getDashboardSummary = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { wardId, pollingStationId } = req.query;

        if (!wardId) {
            return res.status(400).json({
                success: false,
                message: "wardId is required",
            });
        }

        const validPollingStationId =
            pollingStationId &&
            pollingStationId !== "null" &&
            pollingStationId !== "undefined" &&
            pollingStationId.trim() !== "";

        console.log("VALID:", validPollingStationId, " RAW:", pollingStationId);





        // =====================================================
        //  CASE 1: wardId only → return summary for all stations
        // =====================================================
        if (!validPollingStationId) {
            const pollingStations = await PollingStation.find({
                wardId,
                isDelete: false,
            });

            let results = [];

            for (const ps of pollingStations) {
                const filter = { wardId, pollingStationId: ps._id, isDelete: false };

                const totalVoters = await Voter.countDocuments(filter);
                const voted = await Voter.countDocuments({ ...filter, voted: true });
                const turnout = totalVoters > 0 ? ((voted / totalVoters) * 100).toFixed(2) : 0;


                const partySummary = await Voter.aggregate([
                    {
                        $match: {
                            wardId: new mongoose.Types.ObjectId(wardId),
                            pollingStationId: ps._id,     // ✅ FIXED
                            isDelete: false,
                        },
                    },
                    {
                        $group: {
                            _id: "$partySupport",
                            total: { $sum: 1 },
                            voted: {
                                $sum: {
                                    $cond: [{ $eq: ["$voted", true] }, 1, 0],
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "parties",
                            localField: "_id",
                            foreignField: "_id",
                            as: "party",
                        },
                    },
                    { $unwind: "$party" },
                    {
                        $project: {
                            partyId: "$party._id",
                            partyName: "$party.name",
                            color: "$party.color",
                            total: 1,
                            voted: 1,
                        },
                    },
                ]);
                results.push({
                    pollingStationId: ps._id,
                    pollingStationName: ps.name,
                    totalVoters,
                    voted,
                    turnout,
                    partySummary,
                });
            }

            return res.status(200).json({
                success: true,
                mode: "WARD",
                data: results,
            });
        }

        // =====================================================
        //  CASE 2: wardId + pollingStationId → single summary
        // =====================================================

        const filter = { wardId, pollingStationId, isDelete: false };

        const totalVoters = await Voter.countDocuments(filter);
        const voted = await Voter.countDocuments({ ...filter, voted: true });
        const turnout = totalVoters > 0 ? ((voted / totalVoters) * 100).toFixed(2) : 0;


        const partySummary = await Voter.aggregate([
            {
                $match: {
                    wardId: new mongoose.Types.ObjectId(wardId),
                    pollingStationId: new mongoose.Types.ObjectId(pollingStationId),
                    isDelete: false,
                },
            },
            {
                $group: {
                    _id: "$partySupport",
                    total: { $sum: 1 },
                    voted: {
                        $sum: {
                            $cond: [{ $eq: ["$voted", true] }, 1, 0],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "parties",             // <-- your collection name
                    localField: "_id",           // <-- partySupport ObjectId
                    foreignField: "_id",
                    as: "party",
                },
            },
            { $unwind: "$party" },
            {
                $project: {
                    partyId: "$party._id",
                    partyName: "$party.name",
                    color: "$party.color",
                    total: 1,
                    voted: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            mode: "POLLING_STATION",
            summary: {
                totalVoters,
                voted,
                turnout,
            },
            partySummary,
        });
    } catch (error) {
        console.log("Dashboard Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
