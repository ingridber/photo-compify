import { Request, Response } from "express";
import type { AuthRequest } from "../types";
import { Report } from "../models/Reports";
import { Resend } from "resend";
import { User } from "../models/User";


// RESEND
const resend = new Resend(process.env.RESEND_API_KEY);

/*
----- REPORT -----
_id: 6a21401b6655a1f6b5162d4e
reportId: "RPT-1780577542763-667"
reportedUserId: 69f9dfb45f5f17deb4705adb
submissionId: 6a169ca10f832985db2f5481
competitionId: 6a136be5f281cce5b4ab29f1
name: "ingrid"
email: "rut.ingrid.berggren@gmail.com"
description: "final test"
evidenceImg: null | ObjectId('6a09f9838f1874e7c226d3c5')
createdAt: 2026-06-04T12:52:22.771+00:00
updatedAt: 2026-06-04T12:52:22.771+00:00
resolved: false

----- SUBMISSION -----
_id: 6a169ca10f832985db2f5481
competition: 6a136be5f281cce5b4ab29f1
user: 69f9dfb45f5f17deb4705adb
image: 6a169ca00f832985db2f5480
votes: Array (empty)
createdAt: 2026-05-27T07:26:25.049+00:00
updatedAt: 2026-05-27T07:26:25.049+00:00

----- USERS -----
_id: 69f9dfb45f5f17deb4705adb
username: "testing2"
email: "asdfasdf@asdsdf.asdf"
password: "$2b$10$fmfngZhK4NYu4xbXO5p8ceIJosHxMFTLxW6tPdEtyE2qZcsU.39qC"
warnings: 0
loginAttempts: 0
__v: 1
profilePicture: 6a0c66be5b49ba5cb6ec4bcd
themes: Array (empty)


----- IMAGE -----
_id: 69f8833a5d8f369d79229912
filename: "1777894201571-test.jpg"
uploadedAt: 2026-05-04T11:30:02.195+00:00
fileSize: 692617
fileFormat: "image/jpeg"
__v: 0

*/




// ----- CHECK REPORT -----
// ------------------------

// Lösning för att minimera calls till supabase för att hantera att bild inte laddas upp innan create
// check -> ladda upp bild -> create report
export async function checkNoPreviousReport(req: Request, res: Response) {

    try {
        const {email, submissionId} = req.body;
        const existingReport = await Report.findOne({ email, submissionId, });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                message: 'You have already reported this image.',
                reportId: existingReport.reportId
            });
        }

        return res.status(200).json({ success: true })
        
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to check report with server"
        })
    }
}



// ----- CREATE REPORT -----
// -------------------------
export const createReport = async (req: Request, res: Response) => {

    try {
        const {
            reportedUserId,
            submissionId,
            competitionId,
            name,
            email,
            description,
            evidenceImg,
        } = req.body;

        const reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // skapa rapport 
        const report =
            await Report.create({
                reportId,
                reportedUserId,
                submissionId,
                competitionId,
                name,
                email,
                description,
                evidenceImg,
            });

        // meddela via mail om skapad rapport - kanske ha med i mailet vad användaren skrivit i beskrivningen och vilken bild hen anmält?
        try {
            await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: email,
                    subject: "Report Submitted",
                    html: 
                        `<h1>Report received</h1>
                        <p>Your report (ID: ${reportId}) has been successfully submitted.</p>
                        <p>We will review the report and contact you if additional information is required.</p>
                        <br>
                        <p><strong>You can not reply to this email.</strong></p>
                        <br>
                        <p>Regards,</p>
                        <p>Photo Compify</p>
                        `
                })
        } catch(err) {
            console.log("Failed to send report mail: ", err)
        }

        return res.status(201).json({
            success: true,
            data: report,
            message: 'Report submitted successfully',
            reportId
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Failed to create report",
        });
    }
};

type PopulatedImage = {
    _id: string;
    getSignedUrl(): Promise<string | null>;
};

type PopulatedSubmission = {
    image?: PopulatedImage;
};

// ----- GET REPORTS -----
// -----------------------
export async function getReports(req: AuthRequest, res: Response ) {

    try {
        const reports = await Report.find({
            resolved: false,
        })
        .populate(
            "reportedUserId",
            "email warnings username"
        )
        .populate("evidenceImg")
        .populate({
            path: "submissionId",
            populate: {
                path: "image",
            },
        })
        .populate("competitionId",
            "title"
        )
        
        const populatedReports = await Promise.all(
            reports.map(async (report) => {

            const submission = report.submissionId as PopulatedSubmission;

            const evidence = report.evidenceImg as unknown as PopulatedImage;

            let evidenceImg = null; 
            
            if(evidence) { 
                evidenceImg = { 
                    _id: evidence._id, 
                    url: await evidence.getSignedUrl(), 
                }} 
                
            let submissionImage = null; 
            if (submission?.image) { 
                submissionImage = { 
                    _id: submission.image._id, 
                    url: await submission.image.getSignedUrl(), 
                }}

                return {
                    ...report.toObject(),
                    evidenceImg,
                    submissionImage,
                };

            })
        )

        return res.status(200).json({
            data: populatedReports,
        });
    } catch (err) {
    console.error("GET REPORTS ERROR:", err);

    return res.status(500).json({
        message: "Failed to fetch reports"
    })
}
}

// ----- REPORT USER -----
// -----------------------
export async function reportUser(req: AuthRequest, res: Response) {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $inc: {warnings: 1}},
            {new: true}
        );

        if (!user) {
            return res.status(404).json({
                message: 'Could not find user',
                status: 404,
            })
        }

        return res.status(200).json({
            message: "Warning Added"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to report user. Internal server error"
        })
    }
}

// ----- RESOLVE REPORT -----
// --------------------------
export async function resolveReport(req: AuthRequest, res: Response) {
    try {
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            {resolved: true,
            auditedBy: req.body.auditedBy,
            },
            {new: true}
            
        );

        const reportedUserContact = req.body.reportedUserContact;
        const reportedUserWarnings = req.body.reportedUserWarnings++;
        const reportId = req.body.reportId;
        const filename = req.body.filename;
        const uploaded = req.body.uploaded;
        const compTitle = req.body.compTitle;
        const responseContact = req.body.responseContact;

        if (!report) {
            return res.status(404).json({
                message: 'Could not find report',
                status: 404,
            })
        }

        try {
            await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: reportedUserContact,
                    subject: "Official Warning",
                    html: 
                        `<h1>Official Warning Regarding Removed Photo Submission</h1>
                        <p>We have completed our review of a report (ID: ${reportId}) concerning a photo you submitted.</p>
                        <p><strong>Image:</strong> ${filename}</p>
                        <p><strong>Uploaded:</strong> ${uploaded}</p>
                        <p><strong>Competition:</strong> ${compTitle}</p>
                        <p>After careful review, we have determined that this image violates our community guidelines. As a result, the image has been removed, and a warning has been issued to your account.</p>
                        <br>
                        <p>Please note that accounts receiving three warnings may be suspended or permanently banned from the platform. You currently have <strong>${reportedUserWarnings} warning(s)</strong> on your account.</p>
                        <br>
                        <p>If you believe this decision was made in error, you may contact our support team for further review.</p>
                        <p><strong>Please do not reply to this email, as this mailbox is not monitored.</strong></p>

                        <p>Regards,</p>
                        <p>The Photo Compify Team</p>
                        `
                })
        } catch(err) {
            console.log("Failed to send warning (mail): ", err)
        }

        try {
            await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: responseContact,
                    subject: "Your Report Has Been Reviewed",
                    html: 
                        `<h1>Report Approved – Action Taken</h1>
                        <p>We have completed our review of a report (ID: ${reportId}) concerning a photo you reported.</p>
                        <p>After reviewing the content, we found that it violated our community guidelines. The reported image has been removed, and appropriate moderation measures have been applied to the account involved.</p>
                        <br>
                        <p>Thank you for helping us maintain the quality and integrity of our community.</p>
                        <br>
                        <p><strong>Please do not reply to this email, as this mailbox is not monitored.</strong></p>

                        <p>Regards,</p>
                        <p>The Photo Compify Team</p>
                        `
                })
        } catch(err) {
            console.log("Failed to send report response (mail): ", err)
        }

        return res.status(200).json({
            message: "Report resolved"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to resolve report. Internal server error"
        })
    }
}

