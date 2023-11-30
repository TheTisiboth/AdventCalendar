import { Link } from "@tanstack/react-router";

export const ExpiredNotice = () => {
    return (
        <div className="expired-notice">
            <span>Time has come!!!</span>
            <p>You can now open your <Link to="/calendar">advent calendar</Link></p>
        </div>
    );
};
