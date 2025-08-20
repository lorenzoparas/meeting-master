document.addEventListener('DOMContentLoaded', function () {
    const pickButton = document.getElementById('pickButton');
    const removeButton = document.getElementById('removeButton');
    const teamMembersTextarea = document.getElementById('teamMembers');
    const resultDiv = document.getElementById('result');
    let lastSelectedMember = '';

    // Load saved team members if any
    chrome.storage.local.get(['teamMembers'], function (data) {
        if (data.teamMembers) {
            teamMembersTextarea.value = data.teamMembers.join('\n');
        }
    });

    pickButton.addEventListener('click', function () {
        // Get team members from textarea and clean up the input
        const teamMembers = teamMembersTextarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (teamMembers.length === 0) {
            resultDiv.innerHTML = `
                <div class="warning-message">
                    <span class="material-icons">warning</span>
                    <span>Add some names.</span>
                </div>`;
            return;
        }

        // Save the current list
        chrome.storage.local.set({ teamMembers });

        // Pick a random team member
        const randomIndex = Math.floor(Math.random() * teamMembers.length);
        const selectedMember = teamMembers[randomIndex];

        // Store and display the selected member
        lastSelectedMember = selectedMember;
        resultDiv.textContent = selectedMember;
        resultDiv.style.animation = 'none';
        resultDiv.offsetHeight; // Trigger reflow
        resultDiv.style.animation = 'pulse 0.3s';

        // Enable remove button
        removeButton.disabled = false;
    });

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .input-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
    }
    textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-family: inherit;
      resize: vertical;
    }
  `;
    document.head.appendChild(style);

    // Initialize remove button as disabled
    removeButton.disabled = true;

    // Handle remove button click
    removeButton.addEventListener('click', function () {
        if (!lastSelectedMember) return;

        // Get current team members and remove the selected one
        const teamMembers = teamMembersTextarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0 && name !== lastSelectedMember);

        // Update the textarea and save
        teamMembersTextarea.value = teamMembers.join('\n');
        chrome.storage.local.set({ teamMembers });

        // Clear the selection and disable remove button
        resultDiv.textContent = '';
        lastSelectedMember = '';
        removeButton.disabled = true;

        // Show feedback
        const feedback = document.createElement('div');
        feedback.textContent = 'Removed from list';
        feedback.style.color = '#666';
        feedback.style.fontSize = '12px';
        feedback.style.marginTop = '12px';
        resultDiv.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 2000);
    });
});
