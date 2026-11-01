const { generateAIResponse } = require("../service/ollamaService.js");

class AIController {
    async generateTasks(req, res) {
        try {
            const { description } = req.body;

            if (!description || !description.trim()) {
                return res.status(400).send({
                    message: 'Project description is required'
                });
            }

            const prompt = `
                You are an expert project manager.

                Based on this project description:
                "${description}"

                Generate 5 development tasks.

                Return ONLY valid JSON in this format:
                {
                    "tasks": [
                        {
                            "title": "Task title",
                            "description": "Task description",
                            "priority": "High",
                            "status": "To Do"
                        }
                    ]
                }

                Priority must be High, Medium, or Low.
                Status must be To Do.
            `;

            const result = await generateAIResponse(prompt);

            const cleanedResult = result
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const parsedResult = JSON.parse(cleanedResult);
            if(
                !parsedResult.tasks ||
                !Array.isArray(parsedResult.tasks) ||
                parsedResult.tasks.length !== 5
            ) {
                throw new Error('Invalid AI response: expected 5 tasks');
            }

            const validPriorities = ['High', 'Medium', 'Low'];

            const isValid = parsedResult.tasks.every(task =>
                task.title?.trim() &&
                task.description?.trim() &&
                validPriorities.includes(task.priority) &&
                task.status === 'To Do'
            );

            if (!isValid) {
                throw new Error('AI generated invalid task data');
            }

            return res.status(200).send(parsedResult);

        } catch (error) {
            console.error('AI task generation error:', error);

            return res.status(500).send({
                message: 'Failed to generate tasks'
            });
        }
    }
}

module.exports = AIController;