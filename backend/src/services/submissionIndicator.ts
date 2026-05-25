import { supabase } from "../config/supabase";


type Indicator =
    | "none"
    | "gold"
    | "silver"
    | "bronze"
    | "voted";


export async function submissionsIndicator(
    submissions: any[]
) {

    return await Promise.all(

        submissions.map(async (submission: any) => {

            let imageUrl = null;

            // ---------- SIGNED IMAGE URL ----------
            if (submission.image?.filename) {

                const { data } = await supabase.storage
                    .from("images")
                    .createSignedUrl(
                        submission.image.filename,
                        60 * 60
                    );

                imageUrl = data?.signedUrl;
            }

            // ---------- DETERMINE PLACEMENT ----------
            let indicator: Indicator = "none";

            const competitionSubmissions =
                submission.competition?.submissions ?? [];

            const sorted = [...competitionSubmissions].sort(
                (a: any, b: any) =>
                    (b.votes?.length ?? 0) -
                    (a.votes?.length ?? 0)
            );

            const index = sorted.findIndex(
                (s: any) =>
                    s._id.toString() ===
                    submission._id.toString()
            );

            if (index === 0) {
                indicator = "gold";
            } else if (index === 1) {
                indicator = "silver";
            } else if (index === 2) {
                indicator = "bronze";
            }

            return {
                ...submission.toObject(),
                imageUrl,
                indicator
            };
        })
    );
}