import { useState } from "react";
import infoStyles from "../styles/footer-info-page.module.css";
import dropDrownStyles from "../styles/drop-down.module.css";

export default function Faq() {
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const faqItems = [
        {
            question: "How does the competitions work?",
            answer: `Once a competition is created, it enters the submission phase, which lasts for 5 days. During this period, users can submit their photos.
            
            After the submission phase ends, the competition moves to the voting phase for 2 days. Each user receives 3 votes to distribute among the submissions they like best. Users cannot vote for their own submission, and only one vote can be cast per submission. 
            
            When the voting phase ends, the winners are determined based on the total number of votes received, with prizes awarded for 1st, 2nd, and 3rd place.
            
            In case of a tiebreak, the winners are determined based on randomization.`,
        },{
            question: "I want to report a photo",
            answer: 'Navigate to the photo you want to report and open it in full-screen mode. Tap the button with an exclamation mark and complete the report form. Once our administrators have reviewed the report, you will be notified of the outcome using the contact information you provided in the form.',
        },{
            question: "Where can i access my data?",
            answer: (<>In the footer at the bottom of this page, you will find a link to <a href="/gdpr"><strong>GDPR</strong></a>. Please navigate there to learn more about our data protection practices and how to collect your data.</>),
        },{
            question: "Where do i find your community guidelines?",
            answer: (<>In the footer at the bottom of this page, you will find a link to <a href="/guidelines"><strong>GUIDELINES</strong></a>. Please review these guidelines to learn more about our community standards, content policies, and the rules regarding image ownership, acceptable uploads, and user conduct.</>),
        },
    ];

    const toggleQuestion = (index: number) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    return (
        <div className={infoStyles.container}>
            <h1 className={infoStyles.title}>FAQ</h1>

            {faqItems.map((item, index) => {
                const isOpen = openQuestion === index;

                return (
                    <div key={index} className={dropDrownStyles.item}>
                        <button
                            className={dropDrownStyles.itemButton}
                            onClick={() => toggleQuestion(index)}
                        >
                            <span className={dropDrownStyles.itemTitle}>{item.question}</span>

                            <img
                                src="/icons/arrow.svg"
                                alt="Toggle answer"
                                className={`${dropDrownStyles.showIcon} ${
                                    isOpen ? dropDrownStyles.open : ""
                                }`}
                            />
                        </button>

                        {isOpen && (
                            <div className={dropDrownStyles.openItemWrapper}>
                                <p className={dropDrownStyles.openItem}>
                                    {item.answer}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}