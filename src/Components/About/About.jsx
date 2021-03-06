import React from "react";
import "./About.css";

const About = (props) => {
  return (
    <section id="about">
      <div className="wrapper">
        <article>
          <div className="title">
            <h3>A little about me!</h3>
            <p className="separator" />
          </div>
          <div className="desc full">
            <h4 className="subtitle">My name is Imran.</h4>
            <p>
              A young, dynamic & highly passionate self-driven management
              professional, who always believes in doing things creatively &
              innovatively.
            </p>
            <p>
              This passion for creating new ideas took me into diversifying my
              horizons in various fields. I believe that "Power is gained by
              sharing Ideas & Learning" and so I am always curious to know more
              and discover the wider aspects of nature. I failed and I failed
              passionately, I love every bit of my failure." Learning Everyday ,
              Living Everyday " this quote boosts my energy towards the
              achievement of my goals.
            </p>
          </div>
          <div className="title">
            <h3>About</h3>
            <p className="separator" />
          </div>
          <div className="desc">
            <h4 className="subtitle">Know About me!</h4>
            <p>
              I am a passionate and creative developer from India with a strong
              interest in Open source projects. I am currently enrolled in a
              Bachelor of Technology ( B. Tech ) degree in Civil Engineering. I
              mostly work on full stack web development with Cloud-Native
              technologies.
            </p>

            <p>
              I have contributed to some of the small Open Source projects . I
              am also a startup enthusiast and have experience in building tech
              startups from scratch.
            </p>

            <p>
              I am Fully-committed to designing and developing innovative
              materials. I am highly self-motivated, enthusiastic and always
              willing to learn more.
            </p>
            <p>
              For the back-end I also work with Javascript (NodeJS, Express,
              MongoDB, etc). But, of course, whenever the project requires
              Django, I do Django as well .
            </p>
          </div>
          <div className="desc">
            <h4 className="subtitle">I'm a programmer..</h4>
            <p>
              <ul>
                <li>
                  {" "}
                  I mostly work on developing and debugging web servers, APIs,
                  Libraries and tools using ????????????????????????????????????????.
                </li>
                <li>
                  Proficient in building servers and APIs using ????????????????, ????????????????/????????????????.
                </li>
                <li>
                  Experience with Cloud service providers (CSPs), including
                  Heroku, ???????????????????????? ???????????? ???????????????????????????????? (????????????).
                </li>
                <li>
                  Proficient with ???????????? / ????????????????????, ????????????????, ???????????? and ???????????????????? scripting.
                </li>
                <li>
                  Experience with Relational Databases (????????????????????, ???????????????????????????????????????? ) and
                  NoSQL databases ( ???????????????????????????? , DyanmoDb(AWS) )
                </li>
                <li>
                  Experience with ???????????????? ( ????????????????????????????, ????????????????????????????. ????????, ????????????????????, ???????????? ????????????????.
                  ???????? ) stack. & Django Framework
                </li>
                <li>
                  Proficient with ???????????????????????? and container orchestration tools such
                  as ????????????????????????????????????????, ????????????????????????-????????????????????.
                </li>
              </ul>
            </p>
          </div>
          <div className="title">
            <h3>Experience</h3>
            <p className="separator" />
          </div>
          <div className="desc full">
          <h4 className="subtitle">Data Engineer & NLP Intern , Episource LLC</h4>
            <p>
            Developed multi-repo documentation service from scratch and deployed on AWS{" "}
            </p>
            <p>
            Designed and implemented CI/CD workflows for continuous integration and validation of documentation.
            </p>
            
            <h4 className="subtitle">Full Stack Developer , Web Cannon-Z</h4>
            <p>
              Developed full-stack web applications which processed, analyzed,
              and rendered data visually.{" "}
            </p>
            <p>
              Incorporated scripts using Javascript and Typescript to manage
              time-sensitive updates, including content changes and database
              upgrades
            </p>
            <p>
              Utilized Docker and Kubernetes to to build and run multiple
              portable environments of the software stack, declarative
              configuration, automation, and generating a report of the results
              once per day
            </p>
            <h4 className="subtitle">Technical Incharge ,???????????????????? ????????????????</h4>
            <p>
              Designed technical architecture proposals to enhance and integrate
              club website or Robotics Systems.
            </p>
            <h4 className="subtitle">
              Member at INSTITUTION INNOVATION COUNCIL - BIT SINDRI
            </h4>
            <p>
              Determined the expenditures and benefits of planned events to
              ensure revenue generation as a result.
            </p>
            <h4 className="subtitle">Member at STARTUP CELL - BIT SINDRI</h4>
            <p>
              Mentoring and helping young budding minds to kindle
              entrepreneurship culture among them by providing with incubation
              centres and guidance from successful entrepreneurs.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default About;
