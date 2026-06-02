import { useState } from "react";
import styles from "../styles/faq.module.css";

export default function Faq() {
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const faqItems = [
        {
            question: "Question 1",
            answer: "Answer 1",
        },
        {
            question: "Question 2",
            answer: "Answer 2",
        },
        {
            question: "Question 3",
            answer: "Answer 3",
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