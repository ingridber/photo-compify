import infoStyles from "../styles/footer-info-page.module.css";

export default function Guidelines() {
    return (
        <div className={infoStyles.container}>
            <h2 className={infoStyles.title}>Community Guidelines</h2>
            <p>To maintain a safe and trustworthy community, users may only upload photos that they own or have the legal right to use. By uploading an image, you confirm that it is your own content or that you have obtained the necessary permission from the copyright holder.</p>
            <p>Uploading images that you cannot verify as your own, including copyrighted or third-party content without authorization, is strictly prohibited. Users who violate this policy may be reported by other community members and may receive warnings, temporary restrictions, or permanent account suspension depending on the severity or frequency of the violation.</p>
            <p><strong>Please respect the rights of creators and help keep the platform fair and reliable for everyone.</strong></p>
        </div>
    )
}