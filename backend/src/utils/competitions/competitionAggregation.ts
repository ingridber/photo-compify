export const buildActiveCompetitionAggregation = (now: Date) => {
  return [
    {
      $addFields: {
        // Bestäm vilken fas tävlingen befinner sig i baserat på nuvarande tid
        phase: {
          $switch: {
            branches: [
              {
                // SUBMISSION-FAS:
                // Nuvarande tid är efter startDate men före votingStartDate
                case: {
                  $and: [
                    { $gte: [now, "$startDate"] },
                    { $lt: [now, "$votingStartDate"] },
                  ],
                },
                then: "submission",
              },
              {
                // VOTING-FAS:
                // Nuvarande tid är efter votingStartDate men före endDate
                case: {
                  $and: [
                    { $gte: [now, "$votingStartDate"] },
                    { $lt: [now, "$endDate"] },
                  ],
                },
                then: "voting",
              },
            ],
            // Om inget av villkoren matchar är tävlingen avslutad
            default: "ended",
          },
        },
      },
    },

    {
      // Behåll endast aktiva tävlingar (filtrera bort avslutade)
      $match: {
        phase: { $in: ["voting", "submission"] },
      },
    },

    {
      $addFields: {
        // Beräkna hur mycket tid som är kvar beroende på fas
        timeLeft: {
          $cond: [
            // Om tävlingen är i voting → tid kvar till endDate
            { $eq: ["$phase", "voting"] },
            { $subtract: ["$endDate", now] },

            // Om tävlingen är i submission → tid kvar tills voting startar
            { $subtract: ["$votingStartDate", now] },
          ],
        },

        // Numerisk ranking för sortering av faser
        // 0 = voting (ska visas först)
        // 1 = submission (ska visas efter)
        phaseRank: {
          $cond: [
            { $eq: ["$phase", "voting"] },
            0,
            1,
          ],
        },
      },
    },

    {
      // Slutlig sorteringsregel:
      // 1. Voting-tävlingar först
      // 2. Sedan submission-tävlingar
      // 3. Inom varje fas → kortast tid kvar först
      $sort: {
        phaseRank: 1,
        timeLeft: 1,
      },
    },
  ];
};