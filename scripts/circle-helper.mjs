/**
 *
 */
export default class CircleHelper {
    /**
     *
     * @param data
     */
    static getProgressCircleHtml(data) {
        return `<svg class="progress-ring progress-ring--${data.class}" viewBox="0 0 ${data.diameter} ${data.diameter}" width="${data.diameter}" height="${data.diameter}">
        <circle
          class="progress-ring__circle"
          stroke-width="${data.strokeWidth}"
          stroke-dasharray="${data.circumference}"
          stroke-dashoffset="${data.offset}"
          stroke="${data.color}"
          fill="transparent"
          r="${data.radius}"
          cx="${data.position}"
          cy="${data.position}"
        />
      </svg>`;
    }

    /**
     *
     * @param root0
     * @param root0.current
     * @param root0.max
     * @param root0.radius
     */
    static getProgressCircle({ current = 100, max = 100, radius = 16 }) {
        const circumference = radius * 2 * Math.PI;
        const percent = current < max ? current / max : 1;
        const offset = circumference - (percent * circumference);
        const strokeWidth = 4;
        const diameter = (radius * 2) + strokeWidth;
        const colorClass = Math.round((percent * 100) / 10) * 10;

        return {
            radius: radius,
            diameter: diameter,
            strokeWidth: strokeWidth,
            circumference: circumference,
            offset: offset,
            position: diameter / 2,
            color: 'red',
            class: colorClass
        };
    }
}
