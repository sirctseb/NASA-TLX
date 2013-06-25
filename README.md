NASA-TLX
========

Web based NASA-TLX survey

This page implements the NASA-TLX survey.
It can be used to collect both the absolute workload values and the scale weights.
At the top of the page there are three buttons to select the workload value survey, the weights comparison, or the results of the subject's input.
After the subject inputs responses and the "Enter ratings" or "Enter weights" button is clicked,
the responses are visible in the text box on the Results screen.
**Warning**: The responses stored in the Results screen are overwritten each time responses are submitted.

The results can also be automatically saved to a file by using the provided data server.
To start the server, double-click the startServer.bat file on Windows, or run the startServer.sh script on OSX, Linux, or other Unix-type system.
The page must be loaded after the server is started.
If the page can connect to the server, "Server connected" will be displayed beneath the navigation buttons.
Otherwise, "Server not connected" will be displayed.
When the "Enter ratings" or "Enter weights" button is clicked, the server will save the response text
to a file at results/<prefix>-survey.txt or results/<prefix>-weights.txt respectively.
The <prefix> is taken from the text box labeled "File prefix". This allows you to enter information such as
subject and trial number in the file name. The prefix must be entered in the box before clicking the submit buttons.
**Warning**: If the same prefix is used for two survey or weight responses, the first file saved will be overwritten by the second.


To collect a workload survey, click the Workload Survey button if the survey is not already showing.
If necessary, click the Reset button at the bottom to reset all the sliders to 0.
Have the subject respond to the survey by dragging the sliders to indicate the workload for each scale.
Enter a descriptive file prefix in the text box at the top of the page.
Click the "Enter ratings" button. If the data server is running, the responses will be saved to a file.
The responses will also be visible in the Results screen.

To collect scale weights, click the Weights button if the weights screen is not already showing.
If 'Finished comparisons, please click "Enter weights"' is displayed, reset the screen by clicking the Reset button.
Have the subject select from the pairs of scales displayed by clicking on one or the other.
After the input is complete, 'Finished comparisons, please click "Enter weights"' will be displayed.
Enter a descriptive file prefix in the text box at the top of the page.
Click the "Enter weights" button. If the data server is running, the responses will be saved to a file.
The responses will also be visible in the Results screen.
