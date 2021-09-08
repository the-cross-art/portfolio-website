import React from "react";
import Project from "./Project";
import "./Projects.css";
import MsgBoardImg from "./Images/1.png";
import StockPriceImg from "./Images/2.png";
import PersonalLibraryImg from "./Images/3.png";
import IssueTrackerImg from "./Images/4.png";
import MIConverterImg from "./Images/5.png";
import CortalaImg from "./Images/Cortala.jpg";
import ExerciseTrackerImg from "./Images/6.png";
import BarChartImg from "./Images/7.png";
import TreeMapImg from "./Images/8.png";
import KaliedoscopeImg from "./Images/9.png";
import StockAnweshImg from "./Images/10.png";
import TwitterImg from "./Images/11.jpeg";

const Projects = (props) => {
  return (
    <section id="projects">
      <div className="projects-container">
        <div className="heading">
          <h3 className="title">My Work</h3>
          <p className="separator" />
          <p className="subtitle">
            Here's a list of <u>most</u> of the projects I've been working on
            lately.
          </p>
        </div>
        <div className="projects-wrapper">
          <Project
            title="Kaliedoscope"
            img={KaliedoscopeImg}
            tech="aws js css sass docker d3"
            link="https://the-cross-art.github.io/Kaleidoscope/"
            repo="https://github.com/the-cross-art/Kaleidoscope"
          >
            <small>Built using MERN Stack , React 360 , React Native</small>
            <p>
              Kaleidoscope is a webgame that imparts information about the chief
              monuments and locations from ancient India.Complete Information
              about the monuments are displayed on the webpages with high
              quality visuals
            </p>
            <p>
              Project was awarded Nodal Winner at Toycathon’21 inter-ministerial
              Hackathon initiative organized by Ministry of Education’s
              Innovation Cel{" "}
            </p>
          </Project>
          <Project
            title="Stock Anwesh"
            img={StockAnweshImg}
            tech="js css sass docker d3"
            link="https://stock-anwesh.netlify.app/"
            repo="https://github.com/the-cross-art/WebCannon-Z"
          >
            <small>Built using MERN Stack , Yahoo Finance API</small>
            <p>
              Website build on MERN Stack that helps investing in stocks by
              providing them real time data about stocks prices and predicts the
              stocks price by mentors predictions.
            </p>
            <p>
              Lead the Project, Analysed and improved the Time Complexity of the
              app and help render real time data from Yahoo Finance API{" "}
            </p>
          </Project>
          <Project
            title="Twitter Clone"
            img={TwitterImg}
            tech="react js css sass docker d3"
            link="https://github.com/the-cross-art/Twitter-Clone-React-Native-CLI"
            repo="https://github.com/the-cross-art/Twitter-Clone-React-Native-CLI"
          >
            <small>Built using React Native and Redux</small>
            <p>
              Application created using React Native and Redux to mimic the
              basic design and functionality of the official Twitter
            </p>
            <p>
              Added Advance functionality like Group Chat and story preview
              feature.{" "}
            </p>
          </Project>
          <Project
            title="Junior Scientica"
            img={MsgBoardImg}
            tech="aws js css sass python d3"
            link="http://18.219.245.81/"
            repo="https://github.com/the-cross-art/JSQuiz-mongoDB"
          >
            <small>Built using Django postgresql CSS + Bootstrap.</small>
            <p>
              This is a full-stack website that I made along with my colleague .
              Its an online test taking system made for students during COVID-19
              pandemic.
            </p>
            <p>
              The Website was used by more than 𝟑𝟓𝟎𝟎 𝐒𝐭𝐮𝐝𝐞𝐧𝐭𝐬, (𝟏𝟑+ 𝐒𝐜𝐡𝐨𝐨𝐥𝐬) to
              conduct the their competetive examniations.{" "}
            </p>
          </Project>
          <Project
            title="Virtual Science & technology fair"
            img={PersonalLibraryImg}
            tech="js sass css"
            link="http://sciencefair.modelclubbit.com/"
            repo="https://github.com/the-cross-art/modeX"
          >
            <small>Built using HTML JS + jQuery, CSS + Bootstrap.</small>
            <p>
              Built the Official Website for the National Hackathon ( Virtual
              Science & technology fair ) of MODEL CLUB B.I.T Sindri.
            </p>
            <p>
              I received a Letter of Appreciation as a Web Developer from the
              respected Chairman of Model Club , Milan Kashyap, for my
              contribution towards the Club as a Web Developer during the
              academic session 2020 - 2021.
            </p>
          </Project>
          <Project
            title="MuniTech"
            img={IssueTrackerImg}
            tech="js node css django aws"
            link="http://munitechnova.herokuapp.com/"
            repo="https://github.com/the-cross-art/Muni_Tech"
          >
            <small>
              Built using Django + SQL , JS + jQuery, CSS + Bootstrap and Pug.
            </small>
            <p>
              The whole procedure of complaining about a particular issue and
              then resolution of the same by the Municipality is quite hectic
              and complex. In order to speed up this process and make things
              transparent we have developed our Web Application Muni-Tech.
            </p>
          </Project>
          <Project
            title="De'Vision."
            img={StockPriceImg}
            tech="js node css"
            link="https://devisionmodelclub.herokuapp.com/blogs"
            repo="https://github.com/the-cross-art/blog_App"
          >
            <small>
              Built using Node, Express, MongoDB, JS + jQuery, CSS + Bootstrap
              and Pug.
            </small>
            <p>
              De'Vision is an event page with an opportunity to render your
              artistic vision to the world
            </p>
          </Project>

          <Project
            title="Yelp Camp"
            img={MIConverterImg}
            tech="js node css"
            link="https://whispering-plains-63221.herokuapp.com/"
            repo="https://github.com/the-cross-art/TheWebdevBoot/tree/master/yelpcamp/v2"
          >
            <small>
              Built using Node, Express, mongoDB, JS + jQuery, CSS + Bootstrap
              and Pug.
            </small>
            <p>
              My first full-stack website using RestFul APIS and database. The
              website let you book you fav camping place through online medium.
            </p>
          </Project>
          <Project
            title="Portfolio&Replica"
            img={BarChartImg}
            tech="node js d3 css"
            link="https://portfolioandreplica.imfast.io/"
            repo="https://github.com/the-cross-art"
          >
            <small>Built using nodejs+ CSS, JS and D3.js.</small>
            <p>
              A full functional e-Commerse website for online purchase for
              students.Made this website for a startup base company
              PORTFOLIO&REPLICA!!
            </p>
            <p>
              I received a Letter of Appreciation as a Web Developer from the
              respected Founder of Portfolio&Replica , Abhinav Prakash, for my
              contribution towards the Company as a Web Developer
            </p>
          </Project>
          <Project
            title="Patatap Clone"
            img={CortalaImg}
            tech="js  css"
            link="https://patatapclonepaperjs.imfast.io/"
            repo="https://github.com/the-cross-art/TheWebdevBoot"
          >
            <small>Built using HTML CSS + Bootstrap and JS.</small>
            <p>A unique and Fun WEB Based Game.</p>
            <p>(press any keyboard key and have fun making music)</p>
          </Project>
          <Project
            title="THE GREAT RGB game"
            img={ExerciseTrackerImg}
            tech="js css"
            link="https://thegreatrgbgame.imfast.io/"
            repo="https://github.com/the-cross-art/TheWebdevBoot"
          >
            <small>Built using HTML CSS + Bootstrap and JS.</small>
            <p>Guess the color RGB code!</p>
          </Project>

          <Project
            title="To-Do List"
            img={TreeMapImg}
            tech="js css"
            link="https://codepen.io/yagoestevez/full/bjZygz/"
            repo="https://github.com/the-cross-art/TheWebdevBoot"
          >
            <small>Built using CSS, JS and D3.js.</small>
            <p>A normal T0-Do list with no DataBase.</p>
          </Project>
        </div>
      </div>
    </section>
  );
};

export default Projects;
