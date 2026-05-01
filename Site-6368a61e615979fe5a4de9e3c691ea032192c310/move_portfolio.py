import sys

filepath = 'c:/Users/luisc/Downloads/Site3D AnimaMotion/amarelo.html'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'id="vyra-portfolio"' in line:
        start_idx = i - 3  # Start at the first comment line
    if "uploadInput.value = '';" in line and start_idx != -1:
        # Find the next </script>
        for j in range(i, len(lines)):
            if '</script>' in lines[j]:
                end_idx = j
                break
        break

if start_idx != -1 and end_idx != -1:
    portfolio_lines = lines[start_idx:end_idx+1]
    
    # Check if there's a </section> in the portfolio_lines
    has_closing = False
    for line in reversed(portfolio_lines):
        if '</section>' in line:
            has_closing = True
            break
            
    if not has_closing:
        portfolio_lines.append('      </div>\n    </section>\n')
        
    # Delete from original place
    del lines[start_idx:end_idx+1]
    
    # Insert before the last </div></div><script src="bg-canvas.js">
    insert_idx = -1
    for i in range(len(lines)-1, -1, -1):
        if '<script src="bg-canvas.js">' in lines[i]:
            insert_idx = i - 2
            break
            
    if insert_idx != -1:
        lines = lines[:insert_idx] + portfolio_lines + lines[insert_idx:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print('Successfully moved the portfolio section.')
    else:
        print('Could not find insert point')
else:
    print('Could not find start or end', start_idx, end_idx)
