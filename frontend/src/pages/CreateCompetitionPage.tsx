import CreateCompetitionForm from '../components/CreateCompetitionForm';
import styles from './createCompetitionPage.module.css';

export default function CreateCompetitionPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Create Competition</h1>
        <p>Set up a new competition for participants to enter.</p>
      </header>
      <CreateCompetitionForm />
    </main>
  );
}
