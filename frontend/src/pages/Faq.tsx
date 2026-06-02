import { useState } from "react";
import styles from "../styles/faq.module.css";

export default function Faq() {
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const faqItems = [
        {
            question: "I want to report a photo",
            answer: "Navigate to the photo you want to report and open it in full-screen mode. Tap the exclamation mark icon and complete the report form. Once our administrators have reviewed the report, you will be notified of the outcome using the contact information you provided in the form.",
        },
        {
            question: "Where can i access my data?",
            answer: "Answer 2",
        },
        {
            question: "How does the competitions work?",
            answer: `Once a competition is created, it enters the submission phase, which lasts for 3 days. During this period, users can submit their photos.
            
            After the submission phase ends, the competition moves to the voting phase for 2 days. Each user receives 3 votes to distribute among the submissions they like best. Users cannot vote for their own submission, and only one vote can be cast per submission. 
            
            When the voting phase ends, the winners are determined based on the total number of votes received, with prizes awarded for 1st, 2nd, and 3rd place.`,
        },
    ];

    const toggleQuestion = (index: number) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    return (
        <div className={styles.faqContainer}>
            <h1 className={styles.pageTitle}>FAQ</h1>

            {faqItems.map((item, index) => {
                const isOpen = openQuestion === index;

                return (
                    <div key={index} className={styles.faqItem}>
                        <button
                            className={styles.question}
                            onClick={() => toggleQuestion(index)}
                        >
                            <span>{item.question}</span>

                            <img
                                src="/icons/arrow.svg"
                                alt="Toggle answer"
                                className={`${styles.showAnswerIcon} ${
                                    isOpen ? styles.open : ""
                                }`}
                            />
                        </button>

                        {isOpen && (
                            <div className={styles.answerWrapper}>
                                <p className={styles.answer}>
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