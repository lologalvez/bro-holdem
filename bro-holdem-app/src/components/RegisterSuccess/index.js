import React  from 'react'
import { Link, withRouter } from 'react-router-dom'


function RegisterSuccess({ history }) {
    return <>
      <div className="landing">
            <div className="landing__split">
                <section className="card">
                    <div className="welcome">
                        <h2>Thanks for joining Bro Holdem. Please, proceed to <span><Link className="welcome__link" to="/login">Login</Link></span></h2>
                    </div>
                </section>
            </div>
            <div className="landing__split">
            </div>
        </div>
    </>
}

export default withRouter(RegisterSuccess)
