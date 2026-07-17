import React, { useState } from "react";
// import "./PostQuestion.module.css";
import styles from './PostQuestion.module.css';


function PostQuestion() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  }); 

  const [showCoach, setShowCoach] = useState(false);

  const handleAiFeedback = () => {
    if (formData.title.trim().length < 5) {
      alert("Title must be at least 5 characters");
      return;
    } else

    if (formData.content.trim().length < 10) {
      alert("Content must be at least 10 characters");
      return;
    }

    setShowCoach(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.title.trim().length < 5) {
      alert("Title must be at least 5 characters");
      return;
    }

    if (formData.content.trim().length < 10) {
      alert("Content must be at least 10 characters");
      return;
    }

    console.log("Question Submitted:", formData);

    alert("Question submitted successfully!");
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      content: "",
    });

    setShowCoach(false);
  };

  const insertText = (text) => {
  setFormData({
    ...formData,
    content: formData.content + text,
  });
};

  return (
    <div className="styles.container">
      <p className="styles.subtitle" style={{ fontSize: '10px', color: '#f97316', fontWeight: 'bold' }}>
        ASK THE COHORT
      </p>

      <h1>Publish to the forum</h1>

      <p>
        Public threads help the whole cohort. Write as if a classmate will debug
        your issue tomorrow. They only know what you put on the page.
      </p>
    
        <br />
        <br />

      <div className="styles.guidelines" style={{ border: '1px solid #f97316', borderRadius: '12px',boxShadow: '0 4px 6px #f97316',backgroundColor: '#e6e4e3', padding: '20px',margin: '20px 0' }}>
        <h3>Write questions people can answer in one pass</h3>

        <p>
          Mentors volunteer their time. Give them runnable context, expected vs
          actual behavior, and a tight scope so they can reproduce the issue
          without guessing your setup.
        </p>
        <br />



        <h4>Checklist before you post</h4>

        <ul>
          <li> <strong>Title as a headline</strong> that states the symptom and tech stack, e.g., 'React 19: state resets after navigation'.</li>
          <li> <strong>Repro steps</strong> numbered, with environment (OS, browser, Node version) when it matters.</li>
          <li> <strong>Minimal code</strong> in fenced markdown blocks, trim unrelated lines so readers scan faster.</li>
          <li> <strong>Exact errors</strong> copied verbatim, including stack trace snippets when debugging backend routes.</li>
        </ul>
        <br />

        <h4>Validation rules (enforced by the form)</h4>

        <ul>
          <li> <strong>Title length</strong>: must be between 5 and 255 characters.</li>
          <li> <strong>Body length</strong>: must contain a minimum of 10 characters detailing your problem.</li>
          <li> <strong>Single topic</strong>: split unrelated bugs into separate threads so search and embedding stay precise.</li>
        </ul>
      </div>
      <br />
      <br />

      <div  style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px',margin: '20px 0' }}>

     

      <form onSubmit={handleSubmit} >
        <div className="styles.form-group" >
          <label>Title</label>
          <p style={{ fontSize: '10px'}}>
            be specific and imagine you're asking a question to another person.
          </p>

          <input style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px',margin: '20px 0' }}
            type="text"
            placeholder="e.g. How do I handle state management using Context API in React?"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
          />
        </div>

        <label>What are the details of your problem?</label>
          <p style={{ fontSize: '10px' }}>
            Introduce the problem and expand on what you put in the title. Minimum 10 characters.
          </p>

        <div className="editor-container" style={{border: '1px solid #ddd',borderRadius: '8px',overflow: 'hidden'}}>
          
  <div className="editor-toolbar" style={{ display: 'flex',gap: '8px',padding: '10px',borderBottom: '1px solid #ddd',background:'#f6f0f0'}}>
    <div style={{ border:'none',display: 'flex', gap: '15px',background:'#f6f0f0' }}>
    <button type="button" style={{ border:'none' }}>B</button>
    <button type="button" style={{ border:'none' }}>I</button>
    <button type="button" style={{ border:'none' }}>*/ *</button>
    <button type="button" style={{ border:'none' }}>* _ *</button>
    </div>
  </div>

  <textarea style={{width: '100%',border: 'none',outline: 'none',padding: '12px',resize: 'vertical'}}
    rows="8"
    placeholder="Include all the information someone would need to answer your question. you can use markdown to format code ."
    value={formData.content}
    onChange={(e) =>
      setFormData({
        ...formData,
        content: e.target.value,
      })
    }
  />
</div>

        {/* <div className="styles.form-group">
          <label>What are the details of your problem?</label>
          <p style={{ fontSize: '10px' }}>
            Introduce the problem and expand on what you put in the title. Minimum 10 characters.
          </p>

          <textarea style={{ , borderRadius: '12px', padding: '20px',margin: '20px 0' }}
          
          
            rows="8"
            placeholder="Include all the information someone would need to answer your question. you can use markdown to format code ."
            value={formData.content}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: e.target.value,
              })
            }
          />
        </div> */}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        <button
          type="button"
          onClick={handleAiFeedback}
          style={{  border:'none', width: '120px',height: '20px',borderRadius: '20%' }}
        >
          AI Suggestions
        </button>
        <p style={{ fontSize: '10px' }}>
          Suggestions only. You still need to choose what you post.
        </p>

        {showCoach && (
          <div className="styles.coach-panel">
            <h4>AI Suggestions</h4>

            <ul>
              <li>Add reproduction steps.</li>
              <li>Include exact error messages.</li>
              <li>Provide sample code snippets.</li>
              <li>Clarify expected vs actual behavior.</li>
            </ul>
          </div>
        )}
        </div>
        <br />
        { <hr style={{ border: '1px solid #ddd', borderRadius: '2px',fontSize: 'blur', filter: 'blur(0.00005px)' }} /> }

        <div className="styles.button-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={{ marginTop: '20px', alignItems: 'right', right: '100', border:'none' }}
            type="button"
            className="styles.cancel-btn"
            onClick={handleCancel}
            
          >
            Cancel
          </button>
          <br />

          <button
            type="submit"
            className="styles.submit-btn"
            style={{ marginTop: '20px', backgroundColor: '#f97316', color: 'white',border:'none', width: '100px',height: '25px',borderRadius: '20%' }}
          >
            Post Question
          </button>
        </div>
      </form>
    </div>
     </div>
  );
}

export default PostQuestion;