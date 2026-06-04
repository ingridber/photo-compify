import { Request, Response } from "express";
import { Report } from "../models/Reports";
import { Resend } from "resend";

// RESEND
const resend = new Resend(process.env.RESEND_API_KEY);

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

        // blocka multipla reports 
        const existingReport =
            await Report.findOne({
                email,
                submissionId,
            });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                message: 'You have already reported this image.',
                reportId: existingReport.reportId
            });
        }

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


// ----- HANDLE REPORT -----
// -------------------------